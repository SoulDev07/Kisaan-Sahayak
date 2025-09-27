# PowerShell script to test Voice Command API
# Run with: .\test_voice_command.ps1

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🔬 Voice Command API Test Suite (PowerShell)" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Configuration
$BaseUrl = "http://192.168.0.111:8000"
$VoiceCommandEndpoint = "$BaseUrl/voice-command/"
$TranscribeEndpoint = "$BaseUrl/speech-to-text/"
$RagEndpoint = "$BaseUrl/chat/rag"

# Function to test server health
function Test-ServerHealth {
    Write-Host "🏥 Testing server health..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $BaseUrl -Method GET -TimeoutSec 5
        Write-Host "✅ Server is running!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Cannot connect to server: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Make sure the FastAPI server is running on http://192.168.0.111:8000" -ForegroundColor Yellow
        return $false
    }
}

# Function to find sample audio files
function Find-SampleAudio {
    $possiblePaths = @(
        ".\sample.wav",
        ".\uploaded.wav", 
        ".\routers\sample.wav",
        ".\routers\uploaded.wav",
        "..\vinayak\sample.wav",
        "..\vinayak\uploaded.wav"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            return (Resolve-Path $path).Path
        }
    }
    
    Write-Host "❌ No sample audio files found!" -ForegroundColor Red
    Write-Host "Please ensure you have sample.wav or uploaded.wav in one of these locations:" -ForegroundColor Yellow
    foreach ($path in $possiblePaths) {
        Write-Host "  - $path" -ForegroundColor Gray
    }
    return $null
}

# Function to test voice command
function Test-VoiceCommand {
    param([string]$AudioFilePath)
    
    Write-Host "🎤 Testing Voice Command with: $AudioFilePath" -ForegroundColor Yellow
    
    try {
        # Create multipart form data
        $boundary = [System.Guid]::NewGuid().ToString()
        $fileBytes = [System.IO.File]::ReadAllBytes($AudioFilePath)
        $fileName = [System.IO.Path]::GetFileName($AudioFilePath)
        
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
            "Content-Type: audio/wav",
            "",
            [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes),
            "--$boundary--"
        )
        
        $body = $bodyLines -join "`r`n"
        $bodyBytes = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($body)
        
        $response = Invoke-RestMethod -Uri $VoiceCommandEndpoint -Method POST -Body $bodyBytes -ContentType "multipart/form-data; boundary=$boundary" -TimeoutSec 30
        
        Write-Host "✅ Success!" -ForegroundColor Green
        Write-Host "Action: $($response.action)" -ForegroundColor Cyan
        Write-Host "Summary: $($response.summary)" -ForegroundColor Cyan
        return $true
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseText = $reader.ReadToEnd()
            Write-Host "Response: $responseText" -ForegroundColor Red
        }
        return $false
    }
}

# Function to test RAG with text
function Test-RagWithText {
    param([string]$TextQuery)
    
    Write-Host "🤖 Testing RAG with text: '$TextQuery'" -ForegroundColor Yellow
    
    try {
        $body = @{
            user_query = $TextQuery
            chat_history = ""
            section = "crops"
            top_k = 3
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $RagEndpoint -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
        
        Write-Host "✅ RAG Success!" -ForegroundColor Green
        Write-Host "Action: $($response.action)" -ForegroundColor Cyan
        Write-Host "Response: $($response.response)" -ForegroundColor Cyan
        return $true
    }
    catch {
        Write-Host "❌ RAG Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test cURL equivalent
function Show-CurlExamples {
    param([string]$AudioFilePath)
    
    Write-Host "`n📋 Equivalent cURL Commands:" -ForegroundColor Magenta
    Write-Host "# Test voice command:" -ForegroundColor Gray
    Write-Host "curl -X POST `"$VoiceCommandEndpoint`" -H `"Content-Type: multipart/form-data`" -F `"file=@$AudioFilePath`"" -ForegroundColor White
    
    Write-Host "`n# Test RAG with text:" -ForegroundColor Gray
    Write-Host "curl -X POST `"$RagEndpoint`" -H `"Content-Type: application/json`" -d `"{`\`"user_query`\`":`\`"What's the weather like?`\`",`\`"chat_history`\`":[],`\`"top_k`\`":3}`"" -ForegroundColor White
}

# Main execution
try {
    # Test server health first
    if (-not (Test-ServerHealth)) {
        Write-Host "`n❌ Server is not available. Please start the FastAPI server first." -ForegroundColor Red
        Write-Host "`nTo start the server, run:" -ForegroundColor Yellow
        Write-Host "cd backend/backend" -ForegroundColor White
        Write-Host "python -m uvicorn main:app --host 192.168.0.111 --port 8000 --reload" -ForegroundColor White
        exit 1
    }
    
    Write-Host "`n" + ("-" * 60) -ForegroundColor Gray
    
    # Find sample audio file
    $audioFile = Find-SampleAudio
    
    if ($audioFile) {
        Write-Host "`n📁 Found audio file: $audioFile" -ForegroundColor Green
        
        # Test voice command
        Write-Host "`n" + ("-" * 40) -ForegroundColor Gray
        $voiceSuccess = Test-VoiceCommand -AudioFilePath $audioFile
        
        # Show cURL examples
        Show-CurlExamples -AudioFilePath $audioFile
    } else {
        Write-Host "`n⚠️  No audio file found. Testing with text queries only." -ForegroundColor Yellow
    }
    
    # Test RAG with sample text queries
    $sampleQueries = @(
        "What's the weather like today?",
        "How are my crops doing?",
        "Tell me about my livestock",
        "Show me my farm profile"
    )
    
    foreach ($query in $sampleQueries) {
        Write-Host "`n" + ("-" * 40) -ForegroundColor Gray
        Test-RagWithText -TextQuery $query
    }
    
    Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
    Write-Host "🏁 Testing Complete!" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    
    Write-Host "`n💡 Tips:" -ForegroundColor Yellow
    Write-Host "1. Import FarmerApp.postman_collection.json into Postman for GUI testing" -ForegroundColor White
    Write-Host "2. Check VOICE_COMMAND_TESTING_GUIDE.md for detailed testing instructions" -ForegroundColor White
    Write-Host "3. Use the provided cURL commands for command-line testing" -ForegroundColor White
    
} catch {
    Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
