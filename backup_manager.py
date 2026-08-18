import json
import os
import shutil
from datetime import datetime
from pathlib import Path

class BackupManager:
    """Manages automatic backups and recovery for Kiddo AI Assistant"""
    
    def __init__(self, kiddo_folder="."):
        self.kiddo_folder = Path(kiddo_folder)
        self.backup_folder = self.kiddo_folder / "backups"
        self.state_file = self.kiddo_folder / "kiddo_state.json"
        self.crash_recovery_file = self.kiddo_folder / "crash_recovery.json"
        
        # Create backup folder if it doesn't exist
        self.backup_folder.mkdir(exist_ok=True)
    
    def create_backup(self, backup_name=None):
        """Create a backup of current state"""
        if backup_name is None:
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            backup_name = f"kiddo_backup_{timestamp}"
        
        backup_path = self.backup_folder / f"{backup_name}.json"
        
        try:
            if self.state_file.exists():
                with open(self.state_file, 'r') as f:
                    state_data = json.load(f)
            else:
                state_data = {"messages": [], "config": {}, "timestamp": datetime.now().isoformat()}
            
            # Add metadata
            state_data["backed_up_at"] = datetime.now().isoformat()
            
            with open(backup_path, 'w') as f:
                json.dump(state_data, f, indent=2)
            
            print(f"✅ Backup created: {backup_path}")
            return str(backup_path)
        except Exception as e:
            print(f"❌ Backup failed: {e}")
            return None
    
    def get_today_backups(self):
        """Get all backups from today"""
        today = datetime.now().strftime("%Y-%m-%d")
        backups = []
        
        for backup_file in self.backup_folder.glob("*.json"):
            if today in backup_file.name:
                backups.append(backup_file)
        
        # Sort by modification time (newest first)
        backups.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        return backups
    
    def restore_from_backup(self, backup_file=None):
        """Restore Kiddo state from a backup file"""
        if backup_file is None:
            # Get the latest backup from today
            today_backups = self.get_today_backups()
            if not today_backups:
                print("❌ No backups found for today")
                return False
            backup_file = today_backups[0]
        
        try:
            with open(backup_file, 'r') as f:
                backup_data = json.load(f)
            
            # Save current state as crash recovery file (in case restore fails)
            if self.state_file.exists():
                with open(self.state_file, 'r') as f:
                    current_state = json.load(f)
                with open(self.crash_recovery_file, 'w') as f:
                    json.dump(current_state, f, indent=2)
            
            # Restore the backup
            with open(self.state_file, 'w') as f:
                json.dump(backup_data, f, indent=2)
            
            print(f"✅ Restored from: {backup_file}")
            print(f"⚠️  Previous state saved to: {self.crash_recovery_file}")
            return True
        except Exception as e:
            print(f"❌ Restore failed: {e}")
            return False
    
    def auto_backup(self, interval_minutes=5):
        """Set up automatic backups (call this in your main loop)"""
        import time
        print(f"🔄 Auto-backup enabled (every {interval_minutes} minutes)")
        try:
            while True:
                time.sleep(interval_minutes * 60)
                self.create_backup()
        except KeyboardInterrupt:
            print("⏸️  Auto-backup stopped")
    
    def list_backups(self):
        """List all available backups"""
        backups = sorted(self.backup_folder.glob("*.json"), 
                        key=lambda x: x.stat().st_mtime, reverse=True)
        
        print("\n📋 Available Backups:")
        for i, backup in enumerate(backups, 1):
            stat = backup.stat()
            size_kb = stat.st_size / 1024
            mod_time = datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S")
            print(f"  {i}. {backup.name} ({size_kb:.1f} KB) - {mod_time}")
        print()
    
    def cleanup_old_backups(self, keep_days=7):
        """Delete backups older than specified days"""
        from datetime import timedelta
        cutoff_date = datetime.now() - timedelta(days=keep_days)
        
        deleted_count = 0
        for backup_file in self.backup_folder.glob("*.json"):
            mod_time = datetime.fromtimestamp(backup_file.stat().st_mtime)
            if mod_time < cutoff_date:
                backup_file.unlink()
                deleted_count += 1
        
        print(f"🗑️  Cleaned up {deleted_count} old backups")


# Example usage
if __name__ == "__main__":
    manager = BackupManager()
    
    # Create a backup
    manager.create_backup()
    
    # List all backups
    manager.list_backups()
    
    # Restore from latest today's backup
    # manager.restore_from_backup()
