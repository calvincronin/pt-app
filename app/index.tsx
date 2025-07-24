import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';
import { Audio } from 'expo-av';

const sounds = {
  sound1: require('../assets/sounds/sound1.wav'),
  sound2: require('../assets/sounds/sound2.wav'),
  sound3: require('../assets/sounds/sound3.wav'),
  sound4: require('../assets/sounds/sound4.wav'),
  sound5: require('../assets/sounds/sound5.wav'),
};

export default function TimerScreen() {
  const [minSeconds, setMinSeconds] = useState('10');
  const [maxSeconds, setMaxSeconds] = useState('20');
  const [soundCount, setSoundCount] = useState('0');
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playSound = async () => {
    const count = parseInt(soundCount, 10);
    if (isNaN(count) || count > 5) {
      return;
    }

    const soundKeys = Object.keys(sounds);
    let soundToPlay;

    if (count <= 1) {
      soundToPlay = sounds.sound1;
    } else {
      const soundsToChooseFrom = soundKeys.slice(0, count);
      const randomSoundKey = soundsToChooseFrom[Math.floor(Math.random() * soundsToChooseFrom.length)];
      soundToPlay = sounds[randomSoundKey];
    }

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(soundToPlay);
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play sound', error);
    }
  };

  const startTimer = () => {
    setIsPlaying(true);
    startNewRandomTimer();
  };

  const stopTimer = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCountdown(0);
  };

  const startNewRandomTimer = () => {
    const min = parseInt(minSeconds);
    const max = parseInt(maxSeconds);
    if (isNaN(min) || isNaN(max) || min > max) {
      alert('Please enter valid min and max values.');
      setIsPlaying(false);
      return;
    }

    const randomDuration = Math.floor(Math.random() * (max - min + 1)) + min;
    setCountdown(randomDuration);

    timerRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timerRef.current!);
          playSound();
          startNewRandomTimer();
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Random Looping Timer</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={minSeconds}
          onChangeText={setMinSeconds}
          keyboardType="numeric"
          placeholder="Min Seconds"
        />
        <TextInput
          style={styles.input}
          value={maxSeconds}
          onChangeText={setMaxSeconds}
          keyboardType="numeric"
          placeholder="Max Seconds"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text>Number of Sounds (Max 5):</Text>
        <TextInput
          style={styles.input}
          value={soundCount}
          onChangeText={setSoundCount}
          keyboardType="numeric"
          placeholder="0"
        />
      </View>
      <View style={styles.buttonContainer}>
        {!isPlaying ? (
          <Button title="Start" onPress={startTimer} />
        ) : (
          <Button title="Stop" onPress={stopTimer} />
        )}
      </View>
      <Text style={styles.countdown}>{countdown > 0 ? countdown : ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginHorizontal: 10,
    width: 100,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  countdown: {
    fontSize: 48,
    fontWeight: 'bold',
  },
});