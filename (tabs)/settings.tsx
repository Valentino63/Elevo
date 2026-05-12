import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';


export default function SettingsScreen() {
  const [username, setUsername] = useState('');
  const [archetype, setArchetype] = useState('');
  const [subArchetype, setSubArchetype] = useState('');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  

  useEffect(() => {
    const loadData = async () => {
      const savedUsername = await AsyncStorage.getItem('elevo_username');
      const savedArchetype = await AsyncStorage.getItem('elevo_archetype');
      const savedSubArchetype = await AsyncStorage.getItem('elevo_subarchetype');
      const savedXp = await AsyncStorage.getItem('elevo_xp');
      const savedLevel = await AsyncStorage.getItem('elevo_level');
      if (savedUsername) setUsername(savedUsername);
      if (savedArchetype) setArchetype(savedArchetype);
      if (savedSubArchetype) setSubArchetype(savedSubArchetype);
      if (savedXp) setXp(Number(savedXp));
      if (savedLevel) setLevel(Number(savedLevel));
    };
    loadData();
  }, []);

  return(
    <View style = {styles.container}>
        <ScrollView>
            <Text style = {styles.account}>Account</Text>
            <View style = {styles.separator}></View>
            <Text style = {styles.changeUserName}>Username: {username || 'Not set'}</Text>
            <TouchableOpacity onPress={() => Alert.prompt(
              'Change Username',
              'Enter new username',
              (newUsername) => {
                if (newUsername) {
                  AsyncStorage.setItem('elevo_username', newUsername);
                  setUsername(newUsername);
                }
              }
            )}>
              <Text style={styles.changeUserName}>Change username</Text>
            </TouchableOpacity>
            <View style = {styles.separator}></View>
            <Text style = {styles.archetype}>Archetype</Text>
            <View style = {styles.separator}></View>
            <Text style = {styles.changeArchetype}>Archetype: {archetype || 'Not set'}{subArchetype ? ` · ${subArchetype}` : ''}</Text>
            <TouchableOpacity>
                <Text style = {styles.changeArchetype}>Change archetype</Text>
            </TouchableOpacity>
            <View style = {styles.separator}></View>
            <Text style = {styles.apperance}>Apperance</Text>
            <View style = {styles.separator}></View>
            <Text style = {styles.app}>App</Text>
            <View style = {styles.separator}></View>
            <Text style = {styles.support}>Support</Text>
            <View style = {styles.separator}></View>
            <Text style = {styles.dangerZone}>Danger Zone</Text>
            <View style = {styles.separator}></View>
            <TouchableOpacity onPress={async () => {
                await AsyncStorage.clear();
                setXp(0);
                setLevel(1);
                setUsername('');
                setArchetype('');
                setSubArchetype('')
            }}>
            <Text style={styles.resetButton}>RESET</Text>
            </TouchableOpacity>
        </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  account: {
    color: '#e8e0cc',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  changeUserName: {
    color: '#e8e0cc',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  archetype: {
    color: '#e8e0cc',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  changeArchetype: {
    color: '#e8e0cc',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  apperance: {
    color: '#e8e0cc',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  app: {
    color: '#e8e0cc',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  support: {
    color: '#e8e0cc',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dangerZone: {
    color: '#e8e0cc',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resetButton: {
    color: 'red',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  separator: {
    backgroundColor: '#2a2a2a',
    height: 2,
    marginVertical: 12,
  }
});