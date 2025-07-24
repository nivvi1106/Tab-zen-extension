browser.runtime.onMessage.addListener((request) => {
  if (request.command === 'play-sound') {
    const audio = document.getElementById('audio-player');
    audio.src = request.sound;
    audio.play().catch(error => console.error("Audio play failed:", error));
  }
  //return true; // Keep the message channel open for async response
});