#!/bin/bash

# NASA Space Bio Explorer - Setup Script
# This script sets up the development environment

set -e  # Exit on any error

echo "🚀 NASA Space Bio Explorer - Setup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python 3.8+ is installed
check_python() {
    print_status "Checking Python version..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        print_success "Python 3 found: $(python3 --version)"
        
        # Check if version is 3.8+
        if python3 -c 'import sys; exit(0 if sys.version_info >= (3, 8) else 1)'; then
            print_success "Python version is 3.8 or higher"
        else
            print_error "Python 3.8 or higher is required"
            exit 1
        fi
    else
        print_error "Python 3 is not installed"
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js version..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if version is 18+
        if node -e 'process.exit(parseInt(process.version.slice(1)) >= 18 ? 0 : 1)'; then
            print_success "Node.js version is 18 or higher"
        else
            print_warning "Node.js 18+ recommended for Next.js 15"
        fi
    else
        print_error "Node.js is not installed"
        print_status "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if PostgreSQL is available
check_postgres() {
    print_status "Checking PostgreSQL availability..."
    
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL client found"
    else
        print_warning "PostgreSQL client not found"
        print_status "You can install it or use a Docker container"
    fi
}

# Setup Python virtual environment
setup_python_env() {
    print_status "Setting up Python virtual environment..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Virtual environment created"
    else
        print_warning "Virtual environment already exists"
    fi
    
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    print_status "Upgrading pip..."
    pip install --upgrade pip
    
    print_status "Installing ETL dependencies..."
    pip install -r etl/requirements.txt
    
    print_status "Installing API dependencies..."
    pip install -r services/api/requirements.txt
    
    print_success "Python dependencies installed"
}

# Setup Node.js environment
setup_node_env() {
    print_status "Setting up Node.js environment..."
    
    cd ui
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies..."
        npm install
        print_success "Node.js dependencies installed"
    else
        print_warning "Node.js dependencies already installed"
        print_status "Updating dependencies..."
        npm update
    fi
    
    cd ..
}

# Setup environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Main .env file
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your configuration"
    else
        print_warning ".env file already exists"
    fi
    
    # UI .env.local file
    if [ ! -f "ui/.env.local" ]; then
        cat > ui/.env.local << EOF
# NASA Space Bio Explorer - UI Environment
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
        print_success "Created ui/.env.local file"
    else
        print_warning "ui/.env.local file already exists"
    fi
}

# Setup database (if using Docker)
setup_database() {
    print_status "Setting up database..."
    
    if command -v docker &> /dev/null; then
        print_status "Docker found, you can use the database container"
        print_status "Run: docker-compose -f db/docker-compose.yml up -d"
    else
        print_warning "Docker not found"
        print_status "Please set up PostgreSQL manually and update DATABASE_URL in .env"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p data/kg
    mkdir -p logs
    mkdir -p temp
    
    print_success "Directories created"
}

# Main setup function
main() {
    print_status "Starting NASA Space Bio Explorer setup..."
    
    # Navigate to project root
    cd "$(dirname "$0")/.."
    
    # System checks
    check_python
    check_node
    check_postgres
    
    # Setup environments
    setup_python_env
    setup_node_env
    
    # Configuration
    setup_env_files
    create_directories
    
    # Database setup
    setup_database
    
    echo ""
    print_success "Setup completed successfully! 🎉"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Set up your PostgreSQL database"
    echo "3. Run database migrations: python etl/load_db.py"
    echo "4. Start the API: python services/api_server.py"
    echo "5. Start the UI: cd ui && npm run dev"
    echo ""
    echo "For more information, see README.md"
}

# Run main function
main "$@"