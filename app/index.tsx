import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

const sounds = {
  sound1: require('../assets/sounds/sound1.wav'),
  sound2: require('../assets/sounds/sound2.wav'),
  sound3: require('../assets/sounds/sound3.wav'),
  sound4: require('../assets/sounds/sound4.wav'),
  sound5: require('../assets/sounds/sound5.wav'),
};

const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#9B59B6'];

export default function TimerScreen() {
  const [minSeconds, setMinSeconds] = useState('10');
  const [maxSeconds, setMaxSeconds] = useState('20');
  const [soundCount, setSoundCount] = useState('0');
  const [colorCount, setColorCount] = useState('0');
  const [showCountdown, setShowCountdown] = useState(true);
  const [arrowEnabled, setArrowEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [arrowRotation, setArrowRotation] = useState(0);
  const [circleColor, setCircleColor] = useState('transparent');
  const timerRef = useRef<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const settingsRef = useRef({ minSeconds, maxSeconds, soundCount, colorCount, arrowEnabled });

  useEffect(() => {
    settingsRef.current = { minSeconds, maxSeconds, soundCount, colorCount, arrowEnabled };
  }, [minSeconds, maxSeconds, soundCount, colorCount, arrowEnabled]);

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
    const count = parseInt(settingsRef.current.soundCount, 10);
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
      soundToPlay = sounds[randomSoundKey as keyof typeof sounds];
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
    setCircleColor('transparent');
    setArrowRotation(0);
  };

  const triggerRandomEvents = () => {
    const soundCountNum = parseInt(settingsRef.current.soundCount, 10);
    if (!isNaN(soundCountNum) && soundCountNum > 0) {
      playSound();
    }

    const colorCountNum = parseInt(settingsRef.current.colorCount, 10);
    if (!isNaN(colorCountNum) && colorCountNum > 0) {
      const randomColorIndex = Math.floor(Math.random() * Math.min(colorCountNum, colors.length));
      setCircleColor(colors[randomColorIndex]);
    } else {
      setCircleColor('transparent');
    }

    if (settingsRef.current.arrowEnabled) {
      const randomRotation = Math.floor(Math.random() * 360);
      setArrowRotation(randomRotation);
    }
  };

  const startNewRandomTimer = () => {
    const min = parseInt(settingsRef.current.minSeconds);
    const max = parseInt(settingsRef.current.maxSeconds);
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
          triggerRandomEvents();
          startNewRandomTimer();
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>PT Random Looping Timer</Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Min</Text>
            <TextInput
              style={styles.input}
              value={minSeconds}
              onChangeText={setMinSeconds}
              keyboardType="numeric"
              placeholder="Min Seconds"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Max</Text>
            <TextInput
              style={styles.input}
              value={maxSeconds}
              onChangeText={setMaxSeconds}
              keyboardType="numeric"
              placeholder="Max Seconds"
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text>Unique Alerts: {soundCount}</Text>
          <Slider
            style={{width: 200, height: 40}}
            minimumValue={0}
            maximumValue={5}
            step={1}
            value={parseInt(soundCount, 10)}
            onValueChange={(value) => setSoundCount(String(value))}
          />
        </View>
        <Text style={{fontSize: 12, color: 'grey'}}>*Turn off Silent Mode</Text>
        <View style={styles.inputContainer}>
          <Text>Unique Colors: {colorCount}</Text>
          <Slider
            style={{width: 200, height: 40}}
            minimumValue={0}
            maximumValue={5}
            step={1}
            value={parseInt(colorCount, 10)}
            onValueChange={(value) => setColorCount(String(value))}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text>Show Countdown:</Text>
          <Switch value={showCountdown} onValueChange={setShowCountdown} />
        </View>
        <View style={styles.switchContainer}>
          <Text>Random Arrow:</Text>
          <Switch value={arrowEnabled} onValueChange={setArrowEnabled} />
        </View>
        <View style={styles.buttonContainer}>
          {!isPlaying ? (
            <Button title="Start" onPress={startTimer} />
          ) : (
            <Button title="Stop" onPress={stopTimer} />
          )}
        </View>
        <View style={[styles.circle, { backgroundColor: circleColor }]}>
          {arrowEnabled && (
            <Text style={[styles.arrow, { transform: [{ rotate: `${arrowRotation}deg` }] }]}>↑</Text>
          )}
        </View>
        {showCountdown && <Text style={styles.countdown}>{countdown > 0 ? countdown : ''}</Text>}
      </View>
    </TouchableWithoutFeedback>
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
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputWrapper: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  label: {
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    width: 80,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 10,
  },
  buttonContainer: {
    marginBottom: 10,
  },
  countdown: {
    fontSize: 48,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 60,
  },
  circle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  arrow: {
    fontSize: 150,
    color: 'black',
  },
});