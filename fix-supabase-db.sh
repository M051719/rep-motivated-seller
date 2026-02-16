echo "🔧 Supabase Database Troubleshooting"
echo "=================================="

# Function to check Docker status
check_docker() {
    echo "📋 Checking Docker status..."
    if docker info &>/dev/null; then
        echo "✅ Docker is running"
        docker version --format "Docker version: {{.Server.Version}}"
    else
        echo "❌ Docker is not running"
        echo "Please start Docker Desktop and try again"
        exit 1
    fi
}

# Function to check Supabase CLI
check_supabase_cli() {
    echo "📋 Checking Supabase CLI..."
    if command -v supabase &>/dev/null; then
        supabase --version
        echo "✅ Supabase CLI is available"
    else
        echo "❌ Supabase CLI not found"
        echo "Install with: npm install -g supabase"
        exit 1
    fi
}

# Function to clean up existing containers
cleanup_containers() {
    echo "🧹 Cleaning up existing containers..."

    # Stop all Supabase containers
    docker ps --filter "label=com.supabase.cli.project" -q | xargs -r docker stop

    # Remove stopped containers
    docker container prune -f

    # Remove unused volumes (be careful with this)
    echo "⚠️  Do you want to remove all unused volumes? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        docker volume prune -f
    fi

    echo "✅ Cleanup completed"
}

# Function to update Supabase configuration
update_config() {
    echo "⚙️  Updating Supabase configuration..."

    # Create or update supabase/config.toml
    mkdir -p supabase

    cat > supabase/config.toml << 'EOF'
# Supabase configuration file

project_id = "your-project-id"

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[database]
major_version = 17
port = 54322
shadow_port = 54320

[database.settings]
# Fix worker process issues
max_worker_processes = "8"
max_parallel_workers = "4"
max_parallel_workers_per_gather = "2"
max_parallel_maintenance_workers = "2"

# Memory settings
shared_buffers = "256MB"
effective_cache_size = "1GB"
work_mem = "16MB"

# Connection settings
max_connections = "100"
idle_in_transaction_session_timeout = "60s"
statement_timeout = "30s"

# Logging settings
log_statement = "ddl"
log_min_duration_statement = "1000"

[auth]
enabled = true
port = 54324
site_url = "http://localhost:3000"

[storage]
enabled = true
port = 54325
file_size_limit = "50MB"
image_transformation = true

[edge_functions]
enabled = true
port = 54326

[analytics]
enabled = false
EOF

    echo "✅ Configuration updated"
}

# Function to create custom init script
create_init_script() {
    echo "📝 Creating custom initialization script..."

    mkdir -p supabase/migrations

    cat > supabase/migrations/00000000000000_fix_worker_processes.sql << 'EOF'
-- Fix PostgreSQL worker process configuration
-- This should be applied before other migrations

-- Update PostgreSQL settings
ALTER SYSTEM SET max_worker_processes = 8;
ALTER SYSTEM SET max_parallel_workers = 4;
ALTER SYSTEM SET max_parallel_workers_per_gather = 2;
ALTER SYSTEM SET max_parallel_maintenance_workers = 2;

-- Reload configuration
SELECT pg_reload_conf();

-- Comment for tracking
COMMENT ON DATABASE postgres IS 'Worker processes configured for Supabase';
EOF

    echo "✅ Initialization script created"
}

# Function to start Supabase with enhanced logging
start_supabase() {
    echo "🚀 Starting Supabase with enhanced logging..."

    # Set debug environment
    export SUPABASE_DEBUG=true
    export DOCKER_BUILDKIT=1

    # Start with verbose output
    supabase start --debug 2>&1 | tee supabase-start.log

    # Check if startup was successful
    if supabase status &>/dev/null; then
        echo "✅ Supabase started successfully!"
        supabase status
    else
        echo "❌ Supabase startup failed"
        echo "Check supabase-start.log for details"
        return 1
    fi
}

# Function to test database connection
test_db_connection() {
    echo "🔍 Testing database connection..."

    # Get connection details
    DB_URL=$(supabase status --output json | jq -r '.DB_URL')

    if [ "$DB_URL" != "null" ] && [ -n "$DB_URL" ]; then
        echo "Database URL: $DB_URL"

        # Test connection with psql (if available)
        if command -v psql &>/dev/null; then
            echo "Testing with psql..."
            psql "$DB_URL" -c "SELECT version();" 2>/dev/null && echo "✅ Database connection successful"
        else
            echo "ℹ️  psql not available, install PostgreSQL client to test connection"
        fi
    else
        echo "❌ Could not retrieve database URL"
        return 1
    fi
}

# Function to run database diff safely
run_db_diff() {
    echo "🔄 Running database diff safely..."

    # First, ensure the database is ready
    timeout=60
    counter=0

    while [ $counter -lt $timeout ]; do
        if supabase db diff --schema public,auth,storage 2>/dev/null; then
            echo "✅ Database diff completed successfully"
            return 0
        fi

        echo "⏳ Waiting for database to be ready... ($counter/$timeout)"
        sleep 2
        ((counter += 2))
    done

    echo "❌ Database diff failed after $timeout seconds"
    return 1
}

# Main execution
main() {
    echo "Starting Supabase database troubleshooting..."

    check_docker
    check_supabase_cli

    echo "🔧 Do you want to perform cleanup? (y/N)"
    read -r cleanup_response
    if [[ "$cleanup_response" =~ ^[Yy]$ ]]; then
        cleanup_containers
    fi

    update_config
    create_init_script

    # Stop any running Supabase instance
    supabase stop 2>/dev/null || true

    start_supabase

    if [ $? -eq 0 ]; then
        test_db_connection

        echo "🎯 Do you want to run database diff? (y/N)"
        read -r diff_response
        if [[ "$diff_response" =~ ^[Yy]$ ]]; then
            run_db_diff
        fi
    fi

    echo "🏁 Troubleshooting completed!"
}

# Run main function
main "$@"
