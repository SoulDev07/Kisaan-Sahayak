# Free WhatsApp Integration Setup Guide

This guide will help you set up free WhatsApp integration for your side project using various free and open-source alternatives to Twilio.

## 🆓 Free WhatsApp Providers

### 1. **UltraMsg** (Recommended for beginners)
- **Website**: https://ultramsg.com/
- **Free Tier**: 1000 messages/month
- **Setup**: Very easy
- **Features**: Text, documents, images

### 2. **WAMR** 
- **Website**: https://wamr.app/
- **Free Tier**: 500 messages/month
- **Setup**: Easy
- **Features**: Text, documents, media

### 3. **WhatsApp Web API** (Advanced)
- **Type**: Open source
- **Cost**: Completely free
- **Setup**: Requires QR code scanning
- **Features**: Full WhatsApp functionality

## 🚀 Quick Setup (UltraMsg)

### Step 1: Sign Up
1. Go to https://ultramsg.com/
2. Create a free account
3. Verify your email

### Step 2: Create Instance
1. Login to UltraMsg dashboard
2. Click "Create Instance"
3. Choose "WhatsApp"
4. Follow the QR code setup process
5. Note your Instance ID and Token

### Step 3: Configure Environment Variables
Create a `.env` file in your backend directory:

```bash
# Free WhatsApp Configuration
FREE_WHATSAPP_API_KEY=your_ultramsg_token_here
FREE_WHATSAPP_PHONE_NUMBER=your_whatsapp_number_here
```

### Step 4: Test the Integration
```bash
python test_free_whatsapp.py
```

## 🔧 Alternative Setup (WAMR)

### Step 1: Sign Up
1. Go to https://wamr.app/
2. Create a free account
3. Verify your email

### Step 2: Get API Key
1. Login to WAMR dashboard
2. Go to API section
3. Generate API key
4. Note your API key

### Step 3: Configure Environment Variables
```bash
FREE_WHATSAPP_API_KEY=your_wamr_api_key_here
FREE_WHATSAPP_PHONE_NUMBER=your_whatsapp_number_here
```

### Step 4: Test
```bash
python test_free_whatsapp.py
```

## 🔄 Integration with Document Generation

To use the free WhatsApp service with your document generation:

```python
from services.whatsapp_free import send_whatsapp_message_free

# Send document notification
success = await send_whatsapp_message_free(
    phone_number="+917020744317",
    pdf_path="temp_pdfs/document.pdf",
    scheme_name="PM-KISAN",
    provider="ultramsg"  # or "wamr"
)
```

## 📱 Usage Examples

### Send Simple Message
```python
from services.whatsapp_free import send_text_message_free

success = await send_text_message_free(
    phone_number="+917020744317",
    message="Hello from free WhatsApp service!",
    provider="ultramsg"
)
```

### Send Document
```python
from services.whatsapp_free import FreeWhatsAppService

service = FreeWhatsAppService("ultramsg")
success = await service.send_document(
    phone_number="+917020744317",
    file_path="document.pdf",
    caption="Your generated document"
)
```

## 🆚 Provider Comparison

| Provider | Free Messages | Setup Difficulty | Document Support | Best For |
|----------|---------------|------------------|------------------|----------|
| UltraMsg | 1000/month | Easy | ✅ | Beginners |
| WAMR | 500/month | Easy | ✅ | Small projects |
| WhatsApp Web | Unlimited | Hard | ✅ | Advanced users |

## 🛠️ Troubleshooting

### Common Issues:

1. **"API key not configured"**
   - Check your `.env` file
   - Ensure environment variables are set correctly

2. **"Phone number not configured"**
   - Set `FREE_WHATSAPP_PHONE_NUMBER` in your `.env` file
   - Use format: `+917020744317`

3. **"Provider not implemented"**
   - Check provider name spelling
   - Supported providers: `ultramsg`, `wamr`, `whatsapp_web`

4. **"Message failed to send"**
   - Check your API key validity
   - Verify phone number format
   - Check provider's free tier limits

## 💡 Tips for Side Projects

1. **Start with UltraMsg** - Easiest setup, good free tier
2. **Monitor usage** - Stay within free limits
3. **Test thoroughly** - Use test numbers first
4. **Backup plan** - Have multiple providers ready
5. **Document everything** - Keep setup notes

## 🔗 Useful Links

- [UltraMsg Documentation](https://ultramsg.com/docs)
- [WAMR Documentation](https://wamr.app/docs)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

## 🎯 Next Steps

1. Choose a provider (recommend UltraMsg for beginners)
2. Follow the setup guide above
3. Test with `python test_free_whatsapp.py`
4. Integrate with your document generation system
5. Monitor usage and scale as needed

Happy coding! 🚀 