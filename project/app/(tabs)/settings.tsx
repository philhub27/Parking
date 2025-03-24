import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { Bell, MapPin, Star } from 'lucide-react-native';
import { useState } from 'react';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);
  const [premium, setPremium] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Bell size={20} color="#0891b2" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#cbd5e1', true: '#0891b2' }}
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <MapPin size={20} color="#0891b2" />
            <Text style={styles.settingText}>Location Services</Text>
          </View>
          <Switch
            value={location}
            onValueChange={setLocation}
            trackColor={{ false: '#cbd5e1', true: '#0891b2' }}
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Star size={20} color="#0891b2" />
            <Text style={styles.settingText}>Premium Features</Text>
          </View>
          <Switch
            value={premium}
            onValueChange={setPremium}
            trackColor={{ false: '#cbd5e1', true: '#0891b2' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>About</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Terms of Service</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    overflow: 'hidden',
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#1e293b',
  },
  button: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  buttonText: {
    fontSize: 16,
    color: '#1e293b',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  version: {
    fontSize: 14,
    color: '#64748b',
  },
});