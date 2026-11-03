export const DEFAULT_CONTENT = {
  welcome_heading: "Sing a new song to the Lord",
  welcome_message:
    "Every song, every key, every heartbeat — gathered in one place so our worship team can prepare with excellence and lead our church with one voice.",
  church_description:
    "Christ the Rock Covenant Church Camarin is a family of believers in Caloocan City, gathered to worship Jesus with everything we are — on Sunday mornings and in every ordinary moment between.",
  team_info:
    "Our worship ministry is made up of singers, instrumentalists, and audio volunteers who rehearse weekly, pray together, and serve the church with humility. We believe preparation is an act of worship: the more prepared we are, the more freely we can lead.",
  announcements:
    "Worship team rehearsal is every Saturday at 7:00 PM in the sanctuary. Bring your charts and your instruments — and come ready to pray together before we play.",
  service_times: "Sunday Worship · 8:00 AM & 10:30 AM",
  contact_email: "",
  hero_image_url: "images/hero.svg",
};

/** Site content record merged over the defaults, ignoring blank fields. */
export function mergeContent(record) {
  const merged = { ...DEFAULT_CONTENT };
  Object.entries(record ?? {}).forEach(([key, value]) => {
    if (typeof value === "string" && value.trim()) merged[key] = value;
  });
  return merged;
}

export const PLACEHOLDER_SONGS = [
  {
    id: "sample-1",
    title: "Way Maker",
    artist: "Sinach",
    category: "worship",
    song_key: "G",
    bpm: 68,
    description: "A slow, spacious declaration of God's faithfulness — ideal for the response segment.",
  },
  {
    id: "sample-2",
    title: "Goodness of God",
    artist: "Bethel Music",
    category: "worship",
    song_key: "A",
    bpm: 63,
    description: "Warm and congregational; builds gently into a full-band chorus.",
  },
  {
    id: "sample-3",
    title: "This Is Amazing Grace",
    artist: "Phil Wickham",
    category: "praise",
    song_key: "B",
    bpm: 96,
    description: "Strong opening anthem with a driving feel and an easy singalong hook.",
  },
  {
    id: "sample-4",
    title: "House of the Lord",
    artist: "Phil Wickham",
    category: "praise",
    song_key: "E",
    bpm: 104,
    description: "Bright, joyful and celebratory — great for the call to worship.",
  },
];

export const PLACEHOLDER_SETLIST = {
  id: "sample-setlist",
  title: "Sunday Worship Gathering",
  service_date: "2026-11-01",
  status: "published",
  notes: "",
};

export const PLACEHOLDER_ITEMS = PLACEHOLDER_SONGS.map((song, index) => ({
  id: `sample-item-${index}`,
  song_id: song.id,
  song_title: song.title,
  artist: song.artist,
  category: song.category,
  song_key: song.song_key,
  bpm: song.bpm,
  position: index + 1,
  is_closing: index === 1,
  reference_audio_url: null,
  backing_track_url: null,
}));