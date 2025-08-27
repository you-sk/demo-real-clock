let selectedTimezone = 'local';

const timezoneNames = {
    'local': 'ローカル時間',
    'UTC': 'UTC',
    'America/New_York': 'ニューヨーク',
    'America/Los_Angeles': 'ロサンゼルス',
    'Europe/London': 'ロンドン',
    'Europe/Paris': 'パリ',
    'Asia/Tokyo': '東京',
    'Asia/Shanghai': '上海',
    'Asia/Dubai': 'ドバイ',
    'Australia/Sydney': 'シドニー'
};

function createMinuteMarkers(clockId) {
    const clock = document.querySelector(`#${clockId} .minute-markers`);
    
    for (let i = 0; i < 60; i++) {
        if (i % 5 !== 0) {
            const marker = document.createElement('div');
            marker.className = 'minute-marker';
            marker.style.transform = `translateX(-50%) rotate(${i * 6}deg)`;
            clock.appendChild(marker);
        }
    }
}

function getTimeForTimezone(timezone) {
    const now = new Date();
    
    if (timezone === 'local') {
        return {
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: now.getSeconds(),
            milliseconds: now.getMilliseconds(),
            timeString: now.toLocaleTimeString('ja-JP', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            dateString: now.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                weekday: 'short'
            })
        };
    }
    
    const options = {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    const dateOptions = {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
    };
    
    const formatter = new Intl.DateTimeFormat('ja-JP', options);
    const dateFormatter = new Intl.DateTimeFormat('ja-JP', dateOptions);
    const timeString = formatter.format(now);
    const dateString = dateFormatter.format(now);
    
    const utcString = now.toLocaleString('en-US', {
        timeZone: timezone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const tzDate = new Date(utcString);
    
    return {
        hours: parseInt(timeString.split(':')[0]),
        minutes: parseInt(timeString.split(':')[1]),
        seconds: parseInt(timeString.split(':')[2]),
        milliseconds: now.getMilliseconds(),
        timeString: timeString,
        dateString: dateString
    };
}

function updateClock(clockId, timezone) {
    const time = getTimeForTimezone(timezone);
    
    const secondsWithMs = time.seconds + time.milliseconds / 1000;
    const minutesWithSec = time.minutes + secondsWithMs / 60;
    const hoursWithMin = (time.hours % 12) + minutesWithSec / 60;
    
    const hourDegrees = hoursWithMin * 30;
    const minuteDegrees = minutesWithSec * 6;
    const secondDegrees = secondsWithMs * 6;
    
    const hourHand = document.querySelector(`#${clockId} .hour-hand`);
    const minuteHand = document.querySelector(`#${clockId} .minute-hand`);
    const secondHand = document.querySelector(`#${clockId} .second-hand`);
    
    hourHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${hourDegrees}deg)`;
    minuteHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${minuteDegrees}deg)`;
    secondHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${secondDegrees}deg)`;
    
    const digitalClock = document.getElementById(`digital-${clockId}`);
    digitalClock.textContent = time.timeString;
    
    const dateDisplay = document.getElementById(`date-display${clockId.slice(-1)}`);
    if (dateDisplay) {
        dateDisplay.textContent = time.dateString;
    }
}

function getTimezoneOffset(timezone) {
    if (timezone === 'local') {
        const offset = -new Date().getTimezoneOffset();
        const hours = Math.floor(Math.abs(offset) / 60);
        const minutes = Math.abs(offset) % 60;
        const sign = offset >= 0 ? '+' : '-';
        return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    if (timezone === 'UTC') {
        return 'UTC+00:00';
    }
    
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const offset = Math.round((tzDate - utcDate) / (1000 * 60));
    
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    
    return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function updateTimezoneDisplay() {
    const display = document.getElementById('timezone-display1');
    const title = document.getElementById('clock1-title');
    const subBrand = document.querySelector('#clock1 .sub-brand');
    
    if (selectedTimezone === 'local') {
        title.textContent = 'ローカル時間';
        subBrand.textContent = 'Local Time';
    } else {
        title.textContent = timezoneNames[selectedTimezone] || selectedTimezone;
        subBrand.textContent = selectedTimezone.split('/').pop().replace('_', ' ');
    }
    
    display.textContent = getTimezoneOffset(selectedTimezone);
}

function initClocks() {
    createMinuteMarkers('clock1');
    createMinuteMarkers('clock2');
    
    const hands = document.querySelectorAll('.hand');
    hands.forEach(hand => {
        if (!hand.classList.contains('second-hand')) {
            hand.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        }
    });
    
    const secondHands = document.querySelectorAll('.second-hand');
    secondHands.forEach(hand => {
        hand.style.transition = 'transform 0.1s cubic-bezier(0.4, 0.0, 0.2, 1)';
    });
    
    const timezoneSelect = document.getElementById('timezone-select');
    timezoneSelect.addEventListener('change', (e) => {
        selectedTimezone = e.target.value;
        updateTimezoneDisplay();
    });
    
    updateTimezoneDisplay();
    
    function updateAllClocks() {
        updateClock('clock1', selectedTimezone);
        updateClock('clock2', 'UTC');
    }
    
    updateAllClocks();
    setInterval(updateAllClocks, 50);
}

document.addEventListener('DOMContentLoaded', initClocks);