// Spotify Official Iframe Controller & 100% Dynamic Location-Aware Stream Store

export interface RegionStation {
  code: string;
  name: string;
  flag: string;
  playlistTitle: string;
  playlistId: string;
}

export const REGIONAL_STATIONS: Record<string, RegionStation> = {
  GLOBAL: {
    code: 'GLOBAL',
    name: 'Worldwide Top 50',
    flag: '🌐',
    playlistTitle: 'Spotify Global Top 50',
    playlistId: '37i9dQZEVXbMDoHDwVN2tF',
  },
  NG: {
    code: 'NG',
    name: 'Nigeria Top 50',
    flag: '🇳🇬',
    playlistTitle: 'Spotify Nigeria Top 50 (Afrobeats)',
    playlistId: '37i9dQZEVXbLw80jjcctV1',
  },
  US: {
    code: 'US',
    name: 'USA Top 50',
    flag: '🇺🇸',
    playlistTitle: 'Spotify USA Top 50',
    playlistId: '37i9dQZEVXbLRQDuF5jeBp',
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom Top 50',
    flag: '🇬🇧',
    playlistTitle: 'Spotify UK Top 50',
    playlistId: '37i9dQZEVXbLnolsZ8PSNw',
  },
  AE: {
    code: 'AE',
    name: 'UAE & Middle East Top 50',
    flag: '🇦🇪',
    playlistTitle: 'Spotify UAE Top 50',
    playlistId: '37i9dQZEVXbM4ms03ZG0JJ',
  },
  DE: {
    code: 'DE',
    name: 'Germany Top 50',
    flag: '🇩🇪',
    playlistTitle: 'Spotify Germany Top 50',
    playlistId: '37i9dQZEVXbJiZcmkrIHGU',
  },
  JP: {
    code: 'JP',
    name: 'Japan Top 50',
    flag: '🇯🇵',
    playlistTitle: 'Spotify Japan Top 50',
    playlistId: '37i9dQZEVXbKXQ4mDTEBXq',
  },
  LOFI: {
    code: 'LOFI',
    name: 'Cyberpunk Lo-Fi Beats',
    flag: '💻',
    playlistTitle: 'Lo-Fi Coding & Focus Beats',
    playlistId: '37i9dQZF1DXdLEN7aqioXM',
  },
};

export interface SpotifyPlayerState {
  isPlaying: boolean;
  stationCode: string;
  station: RegionStation;
  detectedCountry: string;
  playingTrackName: string;
  playingArtistName: string;
}

class SpotifyStore {
  public embedController: any = null;
  private cachedMetadata: Record<string, { title: string; artist: string }> = {};
  private currentPlayingURI: string = '';

  public state: SpotifyPlayerState = {
    isPlaying: false,
    stationCode: 'GLOBAL',
    station: REGIONAL_STATIONS.GLOBAL,
    detectedCountry: 'GLOBAL',
    playingTrackName: 'Spotify Live Stream',
    playingArtistName: 'Spotify Official',
  };

  private listeners: ((state: SpotifyPlayerState) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.detectLocation();
    }
  }

  public setController(controller: any) {
    this.embedController = controller;
    if (this.embedController) {
      try {
        this.embedController.addListener('playback_update', (e: any) => {
          if (e && e.data) {
            const isPaused = e.data.isPaused;
            const playingURI = e.data.playingURI || '';
            this.state.isPlaying = !isPaused;

            if (playingURI && playingURI !== this.currentPlayingURI) {
              this.currentPlayingURI = playingURI;
              this.fetchTrackMetadata(playingURI);
            }
            this.notify();
          }
        });
      } catch (err) {
        console.warn('Spotify controller listener setup:', err);
      }
    }
  }

  public async fetchTrackMetadata(uri: string) {
    try {
      if (this.cachedMetadata[uri]) {
        const cached = this.cachedMetadata[uri];
        this.state.playingTrackName = cached.title;
        this.state.playingArtistName = cached.artist;
        this.notify();
        return;
      }

      let fetchUrl = '';
      if (uri.startsWith('spotify:track:')) {
        const trackId = uri.replace('spotify:track:', '').split('?')[0];
        fetchUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`;
      } else if (uri.startsWith('spotify:episode:')) {
        const episodeId = uri.replace('spotify:episode:', '').split('?')[0];
        fetchUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/episode/${episodeId}`;
      } else if (uri.startsWith('spotify:playlist:')) {
        const playlistId = uri.replace('spotify:playlist:', '').split('?')[0];
        fetchUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${playlistId}`;
      }

      if (fetchUrl) {
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const data = await res.json();
          let title = data.title || 'Live Stream';
          let artist = data.author_name || this.state.station.name;

          // Clean title if it contains " - song and lyrics by " or " - song by "
          if (title.includes(' - song and lyrics by ')) {
            const parts = title.split(' - song and lyrics by ');
            title = parts[0];
            if (!artist || artist === this.state.station.name) artist = parts[1]?.split(' | ')[0] || artist;
          } else if (title.includes(' - song by ')) {
            const parts = title.split(' - song by ');
            title = parts[0];
            if (!artist || artist === this.state.station.name) artist = parts[1]?.split(' | ')[0] || artist;
          }

          this.cachedMetadata[uri] = { title, artist };
          this.state.playingTrackName = title;
          this.state.playingArtistName = artist;
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Error querying Spotify oEmbed track metadata:', err);
    }
  }

  public subscribe(fn: (state: SpotifyPlayerState) => void) {
    this.listeners.push(fn);
    fn(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn({ ...this.state }));
  }

  public async detectLocation() {
    try {
      const res = await fetch('https://api.country.is/');
      const data = await res.json();
      const code = data?.country?.toUpperCase();

      if (code && REGIONAL_STATIONS[code]) {
        this.setStation(code);
        this.state.detectedCountry = code;
      } else {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz.includes('Lagos') || tz.includes('Africa/')) {
          this.setStation('NG');
          this.state.detectedCountry = 'NG';
        } else if (tz.includes('Dubai') || tz.includes('Asia/Dubai')) {
          this.setStation('AE');
          this.state.detectedCountry = 'AE';
        } else if (tz.includes('London') || tz.includes('Europe/London')) {
          this.setStation('GB');
          this.state.detectedCountry = 'GB';
        } else if (tz.includes('New_York') || tz.includes('America/')) {
          this.setStation('US');
          this.state.detectedCountry = 'US';
        }
      }
    } catch {}
  }

  public setStation(code: string) {
    const station = REGIONAL_STATIONS[code.toUpperCase()] || REGIONAL_STATIONS.GLOBAL;
    this.state.stationCode = station.code;
    this.state.station = station;
    this.state.playingTrackName = station.playlistTitle;
    this.state.playingArtistName = station.name;

    if (this.embedController && this.embedController.loadUri) {
      try {
        this.embedController.loadUri(`spotify:playlist:${station.playlistId}`);
      } catch {}
    }
    this.notify();
  }

  public toggle(): boolean {
    if (this.embedController && this.embedController.togglePlay) {
      try {
        this.embedController.togglePlay();
      } catch {}
    }
    this.state.isPlaying = !this.state.isPlaying;
    this.notify();
    return this.state.isPlaying;
  }

  public play() {
    if (this.embedController && this.embedController.resume) {
      try {
        this.embedController.resume();
      } catch {}
    } else if (this.embedController && this.embedController.play) {
      try {
        this.embedController.play();
      } catch {}
    }
    this.state.isPlaying = true;
    this.notify();
  }

  public pause() {
    if (this.embedController && this.embedController.pause) {
      try {
        this.embedController.pause();
      } catch {}
    }
    this.state.isPlaying = false;
    this.notify();
  }

  public next() {
    if (this.embedController && this.embedController.togglePlay) {
      try {
        this.embedController.togglePlay();
      } catch {}
    }
  }

  public prev() {
    if (this.embedController && this.embedController.togglePlay) {
      try {
        this.embedController.togglePlay();
      } catch {}
    }
  }
}

export const spotifyPlayer = new SpotifyStore();
