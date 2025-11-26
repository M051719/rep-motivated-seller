import json
import boto3
import uuid
import time
from datetime import datetime
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }
    
    try:
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        text = body.get('text', '')
        voice_id = body.get('voice', 'Joanna')
        use_async = body.get('async', len(text) > 1000)  # Use async for longer texts
        
        if not text:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Text is required'})
            }
        
        # Initialize AWS clients
        polly = boto3.client('polly', region_name='us-east-1')
        
        # S3 configuration
        bucket_name = 'myamazonpollybucketforrepmotivatedseller'
        
        if use_async:
            # Use async synthesis (like your successful test)
            task_response = polly.start_speech_synthesis_task(
                Text=text,
                OutputFormat='mp3',
                VoiceId=voice_id,
                Engine='neural',
                OutputS3BucketName=bucket_name,
                SampleRate='22050'
            )
            
            task_id = task_response['SynthesisTask']['TaskId']
            
            # Poll for completion (with timeout)
            max_wait_time = 30  # seconds
            start_time = time.time()
            
            while time.time() - start_time < max_wait_time:
                task_status = polly.get_speech_synthesis_task(TaskId=task_id)
                status = task_status['SynthesisTask']['TaskStatus']
                
                if status == 'completed':
                    s3_uri = task_status['SynthesisTask']['OutputUri']
                    # Convert S3 URI to HTTPS URL
                    s3_key = s3_uri.replace(f's3://{bucket_name}/', '')
                    audio_url = f"https://{bucket_name}.s3.us-east-1.amazonaws.com/{s3_key}"
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            **cors_headers,
                            'Content-Type': 'application/json'
                        },
                        'body': json.dumps({
                            'audio_url': audio_url,
                            'task_id': task_id,
                            'text': text,
                            'voice': voice_id,
                            'characters': len(text),
                            'method': 'async'
                        })
                    }
                elif status == 'failed':
                    return {
                        'statusCode': 500,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Speech synthesis failed'})
                    }
                
                time.sleep(2)  # Wait 2 seconds before polling again
            
            # If we get here, it timed out
            return {
                'statusCode': 202,
                'headers': cors_headers,
                'body': json.dumps({
                    'message': 'Speech synthesis in progress',
                    'task_id': task_id,
                    'status': 'processing'
                })
            }
        
        else:
            # Use synchronous synthesis for shorter texts
            s3 = boto3.client('s3', region_name='us-east-1')
            
            # Generate unique filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"tts_{timestamp}_{str(uuid.uuid4())[:8]}.mp3"
            s3_key = f"audio/{filename}"
            
            # Generate speech with Polly
            polly_response = polly.synthesize_speech(
                Text=text,
                OutputFormat='mp3',
                VoiceId=voice_id,
                Engine='neural',
                SampleRate='22050'
            )
            
            # Upload audio to S3
            audio_data = polly_response['AudioStream'].read()
            
            s3.put_object(
                Bucket=bucket_name,
                Key=s3_key,
                Body=audio_data,
                ContentType='audio/mpeg',
                ACL='public-read'
            )
            
            # Generate public URL
            audio_url = f"https://{bucket_name}.s3.us-east-1.amazonaws.com/{s3_key}"
            
            return {
                'statusCode': 200,
                'headers': {
                    **cors_headers,
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({
                    'audio_url': audio_url,
                    'filename': filename,
                    'text': text,
                    'voice': voice_id,
                    'characters': len(text),
                    'method': 'sync'
                })
            }
        
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({
                'error': f'AWS error: {str(e)}'
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({
                'error': f'Internal server error: {str(e)}'
            })
        }