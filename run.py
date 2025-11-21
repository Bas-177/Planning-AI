"""
Start script voor de planningsmodule
"""
import uvicorn
import socket

def get_local_ip():
    """Vind het lokale IP-adres voor netwerk toegang"""
    try:
        # Maak een socket verbinding (wordt niet daadwerkelijk gemaakt)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"

if __name__ == "__main__":
    local_ip = get_local_ip()
    
    print("="*60)
    print("Planning Industrie AI Module")
    print("="*60)
    print("\n" + "="*60)
    print("SERVER GESTART!")
    print("="*60)
    print("\n📱 Toegang vanaf andere apparaten (telefoon, tablet, etc.):")
    print(f"   http://{local_ip}:8000")
    print("\n💻 Toegang vanaf deze computer:")
    print("   http://localhost:8000")
    print("\n📋 Planning pagina's:")
    print(f"   • Week Planning: http://{local_ip}:8000/planning/week")
    print(f"   • Project Planning: http://{local_ip}:8000/projectplanning")
    print(f"   • Orders: http://{local_ip}:8000/orders")
    print("\n" + "="*60)
    print("⚠️  BELANGRIJK: Zorg dat Windows Firewall poort 8000 toestaat")
    print("   (Zie NETWERK_TOEGANG.md voor instructies)")
    print("="*60)
    print("\nDruk op Ctrl+C om te stoppen\n")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload bij code wijzigingen
        log_level="info"
    )

