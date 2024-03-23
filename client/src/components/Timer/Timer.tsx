import React, { useState, useEffect } from 'react';

interface TimerProps {
    initialMinutes: number;
    initialSeconds: number;
    onTimerEnd: () => void; // Callback function to invoke when timer ends
}

const Timer: React.FC<TimerProps> = ({ initialMinutes, initialSeconds, onTimerEnd }) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [minutes, setMinutes] = useState(initialMinutes);
    const [isActive, setIsActive] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive) {
            interval = setInterval(() => {
                if (seconds === 0 && minutes === 0) {
                    clearInterval(interval);
                    setIsActive(false);
                    setIsVisible(false); // Hide the timer when it reaches 0
                    onTimerEnd(); // Invoke the callback when timer ends
                } else if (seconds === 0) {
                    setMinutes(prevMinutes => prevMinutes - 1);
                    setSeconds(59);
                } else {
                    setSeconds(prevSeconds => prevSeconds - 1);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, minutes, seconds]);

    // Render null if the timer is not visible
    if (!isVisible) {
        return null;
    }

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsVisible(true);
        setSeconds(initialSeconds);
        setMinutes(initialMinutes);
    };

    return (
        <>
            <p><b>Cancellation Timer:</b> {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</p>
            {/* <button onClick={toggleTimer}>{isActive ? 'Pause' : 'Start'}</button>
            <button onClick={resetTimer}>Reset</button> */}
        </>
    );
};

export default Timer;
