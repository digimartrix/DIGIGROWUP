/**
 * DigiGrowUp High-Clarity Voice & Speech Engine
 * Configured for maximum volume (1.0), optimal articulation (0.95), and premium natural voices.
 */

export function playLoudClearVoice(textToSpeak) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    // Clear any stuck or paused utterance queues
    synth.cancel();

    // Strip emojis and markdown formatting for clean audio reading
    const cleanText = textToSpeak
      .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
      .replace(/[*_#`~>]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.volume = 1.0; // 100% Maximum loudness
    utterance.rate = 0.95;   // Crisp, clear pronunciation pace
    utterance.pitch = 1.05;  // Bright, pleasant, clear resonance

    // Select the highest quality natural voice available on the device
    const selectBestVoice = () => {
      const voices = synth.getVoices();
      if (!voices || voices.length === 0) return null;

      return (
        voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
        voices.find(v => v.name.includes('Natural') && v.lang.startsWith('en')) ||
        voices.find(v => v.name.includes('Samantha')) ||
        voices.find(v => v.name.includes('Daniel')) ||
        voices.find(v => v.name.includes('Alex')) ||
        voices.find(v => v.name.includes('Karen')) ||
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0]
      );
    };

    const bestVoice = selectBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    synth.speak(utterance);
  } catch (err) {
    console.warn('[SPEECH_SYNTHESIS_WARNING]', err);
  }
}
