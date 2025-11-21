"""
Start script voor de planningsmodule
"""
import uvicorn

if __name__ == "__main__":
    print("="*60)
    print("Planning Industrie AI Module")
    print("="*60)
    print("\nServer starten op http://localhost:8000")
    print("Druk op Ctrl+C om te stoppen\n")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload bij code wijzigingen
        log_level="info"
    )

