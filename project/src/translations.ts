export type Language = 'ru' | 'en';

export const translations = {
  ru: {
    title: 'Звукометр',
    setup: {
      title: 'Начало работы',
      description: 'Для начала работы с приложением, выполните следующие шаги:',
      step1: 'Разрешите доступ к микрофону при запросе',
      step2: 'Нажмите на кнопку микрофона для начала записи',
      step3: 'Наблюдайте за изменениями громкости и частоты в реальном времени',
      understand: 'Понятно'
    },
    about: {
      title: 'О приложении',
      description: 'Это приложение анализирует звук с микрофона и показывает его характеристики в реальном времени.'
    },
    error: 'Пожалуйста, предоставьте доступ к микрофону',
    volume: 'Громкость',
    frequency: 'Частота',
    recording: 'Идет запись...',
    install: 'Установить',
    settings: 'Настройки',
    language: 'Язык',
    soundType: {
      title: 'Тип звука',
      infrasound: 'Инфразвук',
      audible: 'Слышимый звук',
      ultrasound: 'Ультразвук'
    },
    analysis: {
      title: 'Анализ звука',
      human: 'Человеческий голос',
      bird: 'Птица',
      dog: 'Собака',
      cat: 'Кошка',
      unknown: 'Неизвестный источник'
    },
    ranges: {
      low: 'Низкие частоты',
      mid: 'Средние частоты',
      high: 'Высокие частоты'
    }
  },
  en: {
    title: 'Sound Meter',
    setup: {
      title: 'Getting Started',
      description: 'To start using the application, follow these steps:',
      step1: 'Allow microphone access when prompted',
      step2: 'Click the microphone button to start recording',
      step3: 'Watch the volume and frequency changes in real-time',
      understand: 'Got it'
    },
    about: {
      title: 'About',
      description: 'This application analyzes sound from your microphone and shows its characteristics in real-time.'
    },
    error: 'Please grant microphone access',
    volume: 'Volume',
    frequency: 'Frequency',
    recording: 'Recording...',
    install: 'Install',
    settings: 'Settings',
    language: 'Language',
    soundType: {
      title: 'Sound Type',
      infrasound: 'Infrasound',
      audible: 'Audible Sound',
      ultrasound: 'Ultrasound'
    },
    analysis: {
      title: 'Sound Analysis',
      human: 'Human Voice',
      bird: 'Bird',
      dog: 'Dog',
      cat: 'Cat',
      unknown: 'Unknown Source'
    },
    ranges: {
      low: 'Low Frequencies',
      mid: 'Mid Frequencies',
      high: 'High Frequencies'
    }
  }
};