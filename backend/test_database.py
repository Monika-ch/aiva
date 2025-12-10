from app.db.session import SessionLocal
from app.models.user import User
from app.models.portfolio import Portfolio

def test_database_connection():
    """Test database connection and tables"""
    print("\n🧪 Testing Database Connection...\n")
    
    # Create session
    db = SessionLocal()
    
    try:
        # Query users table
        user_count = db.query(User).count()
        print(f"✓ Users table: {user_count} records")
        
        # Query portfolios table
        portfolio_count = db.query(Portfolio).count()
        print(f"✓ Portfolios table: {portfolio_count} records")
        
        print("\n✅ Database connection successful!")
        print("✅ All tables are accessible!")
        
    except Exception as e:
        print(f"❌ Database error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_database_connection()
