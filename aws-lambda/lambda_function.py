import json
import boto3
import base64
import uuid
import os
from botocore.exceptions import ClientError, BotoCoreError
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS services
polly = boto3.client('polly', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')

# Configuration
S3_BUCKET = os.environ.get('S3_BUCKET', 'your-tts-audio-bucket')
S3_PREFIX = 'tts-audio/'
CLOUDFRONT_DOMAIN = os.environ.get('CLOUDFRONT_DOMAIN', '')

def lambda_handler(event, context):
    """
    AWS Lambda handler for Text-to-Speech processing
    """
    try:
        # Parse the request
        if 'body' in event:
            if isinstance(event['body'], str):
                body = json.loads(event['body'])
            else:
                body = event['body']
        else:
            body = event

        # Extract parameters
        text = body.get('text', '')
        voice_id = body.get('voice_id', 'Joanna')
        output_format = body.get('output_format', 'mp3')
        sample_rate = body.get('sample_rate', '22050')
        speed = body.get('speed', 'medium')
        pitch = body.get('pitch', 'medium')
        
        # Validate input
        if not text:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'error': 'Text is required',
                    'success': False
                })
            }

        # Validate text length (Polly has limits)
        if len(text) > 3000:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'error': 'Text too long (max 3000 characters)',
                    'success': False
                })
            }

        # Process SSML for speed and pitch
        ssml_text = create_ssml(text, speed, pitch)

        # Generate unique filename
        audio_id = str(uuid.uuid4())
        s3_key = f"{S3_PREFIX}{audio_id}.{output_format}"

        # Call Amazon Polly
        logger.info(f"Processing TTS for text length: {len(text)}")
        
        response = polly.synthesize_speech(
            Text=ssml_text,
            OutputFormat=output_format,
            VoiceId=voice_id,
            SampleRate=sample_rate,
            TextType='ssml'
        )

        # Upload to S3
        s3.upload_fileobj(
            response['AudioStream'], 
            S3_BUCKET, 
            s3_key,
            ExtraArgs={
                'ContentType': f'audio/{output_format}',
                'CacheControl': 'max-age=31536000',  # 1 year cache
                'Metadata': {
                    'voice_id': voice_id,
                    'text_length': str(len(text)),
                    'generated_at': str(context.aws_request_id)
                }
            }
        )

        # Generate public URL
        if CLOUDFRONT_DOMAIN:
            audio_url = f"https://{CLOUDFRONT_DOMAIN}/{s3_key}"
        else:
            audio_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{s3_key}"

        # Get audio duration (approximate)
        duration = estimate_audio_duration(text)

        logger.info(f"Successfully generated audio: {audio_id}")

        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'audio_url': audio_url,
                'audio_id': audio_id,
                'duration': duration,
                'voice_id': voice_id,
                'text_length': len(text),
                'metadata': {
                    'format': output_format,
                    'sample_rate': sample_rate,
                    'speed': speed,
                    'pitch': pitch
                }
            })
        }

    except ClientError as e:
        logger.error(f"AWS Client Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'error': 'AWS service error',
                'success': False,
                'details': str(e) if os.environ.get('DEBUG') else None
            })
        }

    except BotoCoreError as e:
        logger.error(f"BotoCore Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'error': 'AWS core error',
                'success': False
            })
        }

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'error': 'Internal server error',
                'success': False,
                'request_id': context.aws_request_id
            })
        }

def create_ssml(text, speed='medium', pitch='medium'):
    """
    Create SSML markup for enhanced speech control
    """
    # Speed mapping
    speed_map = {
        'x-slow': '0.6',
        'slow': '0.8',
        'medium': '1.0',
        'fast': '1.2',
        'x-fast': '1.4'
    }
    
    # Pitch mapping
    pitch_map = {
        'x-low': '-20%',
        'low': '-10%',
        'medium': '+0%',
        'high': '+10%',
        'x-high': '+20%'
    }

    rate = speed_map.get(speed, '1.0')
    pitch_value = pitch_map.get(pitch, '+0%')

    # Clean text for SSML
    clean_text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

    ssml = f'''<speak>
        <prosody rate="{rate}" pitch="{pitch_value}">
            {clean_text}
        </prosody>
    </speak>'''

    return ssml

def estimate_audio_duration(text):
    """
    Estimate audio duration based on text length
    Average speaking rate: ~150 words per minute
    """
    word_count = len(text.split())
    duration_minutes = word_count / 150
    duration_seconds = max(1, int(duration_minutes * 60))  # Minimum 1 second
    return duration_seconds

def get_cors_headers():
    """
    Return CORS headers for cross-origin requests
    """
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '3600',
        'Content-Type': 'application/json'
    }