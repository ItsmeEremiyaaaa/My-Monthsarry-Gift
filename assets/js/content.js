/* ==========================================================================
   ALL THE PERSONAL CONTENT LIVES HERE ♡
   Edit any text below — no other file needs to change.
   ========================================================================== */
window.GIFT = {

  /* ---------- Basics ---------- */
  herName: 'Nicole',
  nickname: 'Langgg',
  months: 6,                      // shown as "6th Monthsary", "6 months of us"
  signedBy: 'Jeremiah F. Escubido',

  /* ---------- Music ----------
     Leave empty ('') to use the soft built-in piano/pad melody.
     To use your real song: put an mp3 in an "audio" folder
     (e.g. audio/our-song.mp3) and write that path here.            */
  song: '',
  songLabel: 'Our Song',

  /* ---------- Flower intro ---------- */
  intro: {
    line1: 'Something special is waiting for you…',
    line2: 'For my favorite human…',
    name: 'NICOLE',               // shown as the big reveal
    button: 'Open Your Gift'
  },

  /* ---------- Hero ---------- */
  hero: {
    eyebrow: 'months of us',      // number is added automatically
    poem: ['To my favorite human,', 'my favorite person,', 'and my favorite place to be.'],
    sub: '6 months of love, comfort, loyalty, laughter, and memories.',
    madeWith: 'Made with love, just for you.'
  },

  /* ---------- Our Story (chapters) ----------
     Each chapter = a month card from the old timeline + its photos.
     First photo in "photos" is the big featured one.
     "pos" (optional) = which part of the photo stays in frame when cropped. */
  story: [
    {
      title: 'The Beginning', month: 'Month 1', emoji: '🌷',
      note: 'Nervous smiles, butterflies, first memories made together.',
      message: 'I still remember how easy it felt to smile around you. Somewhere between the first hellos and the late-night talks, you quietly became my favorite part of every day.',
      photos: [
        { file: 'IMG_20260107_220949', cap: 'best days 🌟', w: 1200, h: 1600, pos: '50% 40%' },
        { file: 'IMG_20260104_185616', cap: 'together ♡', w: 1200, h: 1600 },
        { file: 'IMG_20260112_235925_316', cap: 'just us 🌙', w: 900, h: 1600 },
        { file: 'IMG_20260113_001531', cap: 'always you 💫', w: 1200, h: 1600 }
      ]
    },
    {
      title: 'Our First Memories', month: 'Month 2', emoji: '☕',
      note: 'Getting cozy. Learning your coffee order by heart.',
      message: 'Mirror selfies, random photos, and all the little moments I never want to forget. Every picture here is proof that my favorite days are the ones with you in them.',
      photos: [
        { file: 'IMG_20260118_202710_153', cap: 'laughs & love 😊', w: 900, h: 1600, pos: '50% 35%' },
        { file: 'IMG_20260117_151529', cap: 'our world 🌸', w: 1200, h: 1600 },
        { file: 'IMG_20260118_163251', cap: 'forever ours 💞', w: 1200, h: 1600 },
        { file: 'MVIMG_20260127_182701', cap: 'sunshine ☀', w: 1200, h: 1600 }
      ]
    },
    {
      title: 'More Katarantaduhan', month: 'Month 3', emoji: '🌙',
      note: 'Late night conversations. Inside jokes only we understand.',
      message: 'Face paint, silly faces, and laughing until it hurts. Nobody makes me laugh the way you do — and nobody else I would rather be this ridiculous with.',
      photos: [
        { file: 'IMG_20260207_210837', cap: 'your smile 🌼', w: 1600, h: 1200, pos: '55% 60%' },
        { file: 'IMG_20260217_233700_999', cap: "i'm so lucky 🍀", w: 900, h: 1600 },
        { file: 'IMG_20260301_190325_270', cap: 'our laughs 💬', w: 900, h: 1600 },
        { file: 'IMG_20260323_193552_755', cap: 'future plans 🌅', w: 900, h: 1600 }
      ]
    },
    {
      title: 'Together', month: 'Month 4', emoji: '🌻',
      note: 'Through arguments and bigger laughs. Learning each other.',
      message: 'Not every day was perfect, but every day was ours. We learned each other slowly — the soft parts, the stubborn parts — and I chose you through all of it.',
      photos: [
        { file: 'IMG_20260226_081518', cap: 'warm hugs 🤗', w: 1200, h: 1600, pos: '50% 35%' },
        { file: 'IMG_20260201_112347_706', cap: 'us always 🌺', w: 900, h: 1600 },
        { file: 'IMG_20260201_112443_387', cap: 'six months 🎉', w: 900, h: 1600 },
        { file: 'IMG_20260201_112916_759', cap: 'sweet moments 🍬', w: 900, h: 1600 }
      ]
    },
    {
      title: 'Our Promises', month: 'Month 5', emoji: '🎶',
      note: 'Our songs, our places, our little rituals. Our whole world.',
      message: 'Quiet nights, warm hugs, and the kind of comfort that doesn’t need words. These are the moments where I made you promises without even saying them out loud.',
      photos: [
        { file: 'IMG_20260301_195454', cap: 'coffee dates ☕', w: 1200, h: 1600, pos: '50% 55%' },
        { file: 'IMG_20260301_193722', cap: 'rainy days ☔', w: 1600, h: 1284 },
        { file: 'IMG_20260314_210953', cap: 'midnight talks 🌙', w: 1278, h: 727 },
        { file: 'IMG_20260314_211110', cap: 'stargazing ✨', w: 1600, h: 900 }
      ]
    },
    {
      title: 'Our Future', month: 'Month 6 ♡', emoji: '🎉',
      note: 'Half a year of choosing each other. This is just the beginning.',
      message: 'Night walks, new places, and a hand I always want to hold. We’re only at the start of our story, and I can’t wait to see every page we haven’t written yet.',
      photos: [
        { file: 'received_1984368789085374', cap: 'my heart ✦', w: 1200, h: 1600, pos: '50% 55%' },
        { file: 'IMG_20260301_190716_884', cap: 'chose you ♡', w: 900, h: 1600 },
        { file: 'IMG_20260327_191153', cap: 'just being ♡', w: 1600, h: 1200 },
        { file: 'IMG_20260401_221304_009', cap: 'day one ♡', w: 900, h: 1600 }
      ]
    }
  ],

  /* ---------- Little Things I Love About You (flip cards) ---------- */
  reasons: [
    { e: '😊', t: 'Your smile.' },
    { e: '😂', t: 'Your contagious laugh.' },
    { e: '🌟', t: 'Your kind heart.' },
    { e: '🔒', t: 'Loyalty. Always.' },
    { e: '💭', t: 'Those deep talks.' },
    { e: '🍀', t: 'Your patience with me.' },
    { e: '✨', t: 'How you see the world.' },
    { e: '📱', t: 'Good morning texts.' },
    { e: '🫶', t: 'The way you care.' },
    { e: '🌙', t: 'Late night calls.' },
    { e: '☕', t: 'Coffee with you.' },
    { e: '🌤️', t: 'The way you make ordinary days feel special.' },
    { e: '🤭', t: 'How you make me laugh.' },
    { e: '🏡', t: 'The comfort of simply being with you.' },
    { e: '🌼', t: 'The little things you probably don’t even notice.' },
    { e: '💞', t: 'That I get to be yours.' }
  ],
  reasonsDone: '…and a thousand more I haven’t found the words for yet.',

  /* ---------- Things I Want You to Know (note deck) ---------- */
  notes: [
    { icon: '🌸', text: 'Every morning I wake up a little happier knowing you\'re mine and I\'m yours.', author: '— always your person', color: '#e8607a' },
    { icon: '☕', text: 'You are my favorite notification, my softest thought, my warmest home.', author: '— truly, deeply', color: '#b8a0f0' },
    { icon: '🌙', text: 'The way you laugh at your own jokes before finishing them? That\'s my favorite sound.', author: '— forever charmed', color: '#ffb080' },
    { icon: '💌', text: 'Thank you for being my safe place, my comfort, my reason to smile on hard days.', author: '— with all my heart', color: '#80c8b0' },
    { icon: '✨', text: 'Choosing you has been the easiest and best decision I ever made.', author: '— no hesitation', color: '#f890b0' },
    { icon: '🌻', text: 'Six months of proof that something this good is real and it\'s ours.', author: '— still smiling', color: '#a0b8f5' },
    { icon: '🦋', text: 'You make ordinary days feel like the best days of my life.', author: '— every single day', color: '#e8a0f5' },
    { icon: '🌈', text: 'With you, I don\'t just feel loved — I feel understood, and that means everything.', author: '— you get me', color: '#70d8a8' },
    { icon: '🎶', text: 'I catch myself humming happier songs since you came into my life.', author: '— my favorite melody', color: '#ffc070' },
    { icon: '💫', text: 'You are the reason some days feel magical for absolutely no reason at all.', author: '— magic, that\'s you', color: '#a8c0ff' },
    { icon: '🌺', text: 'The little things you do without thinking — those are what I love most.', author: '— the details', color: '#f090a8' },
    { icon: '🍀', text: 'I don\'t believe in luck anymore. I believe in you, us, this.', author: '— it\'s not luck', color: '#88d8a0' },
    { icon: '🌟', text: 'You have this way of making everything feel lighter just by being near.', author: '— my sunshine', color: '#ffc850' },
    { icon: '💝', text: 'I never knew ordinary days could feel this extraordinary until I had you.', author: '— extraordinary us', color: '#e870b0' },
    { icon: '🫶', text: 'Six months and I still get butterflies. That tells me everything.', author: '— still them', color: '#b090f0' },
    { icon: '🌷', text: 'Thank you for choosing me every single day, even on the hard ones.', author: '— grateful always', color: '#f080a8' },
    { icon: '🎀', text: 'You\'re the first person I want to tell good news to, and the first I reach for on bad days.', author: '— my person', color: '#f090c8' },
    { icon: '🌊', text: 'Loving you is the easiest thing I\'ve ever done. It feels like breathing.', author: '— effortlessly', color: '#70c0f5' },
    { icon: '🍓', text: 'You make even the quietest evenings feel like the best kind of adventure.', author: '— our quiet magic', color: '#f08080' },
    { icon: '🕊️', text: 'Your gentleness is the most beautiful thing about you. Don\'t ever change.', author: '— always notice it', color: '#a0b8f0' }
  ],

  /* ---------- Scripture ---------- */
  verse: {
    // Wrap words in [brackets] to make them glow.
    lines: [
      '[Love is patient,] love is kind.',
      'It does not envy, it does not boast, it is not proud.',
      'It always [protects,] always [trusts,]',
      'always [hopes,] always [perseveres.]'
    ],
    ref: '— 1 Corinthians 13:4, 7 (NIV)'
  },

  /* ---------- The Secret Surprise ---------- */
  surprise: {
    teaser: 'There’s something I haven’t told you yet…',
    button: 'Tap to open',
    // Each line appears slowly, one after another. Use '' for a pause,
    // and start a line with * to make it glow.
    lines: [
      'Nicole,',
      '',
      'I don’t always say it the way I want to.',
      'Sometimes the words get stuck somewhere between my heart and my mouth.',
      'So here it is, plainly:',
      '',
      '*You are the best thing that has ever happened to me.',
      'Not because everything is perfect —',
      'but because with you, even the imperfect days feel like home.',
      '',
      'Thank you for choosing me.',
      'I will keep choosing you —',
      'today, tomorrow, and every day after that.',
      '',
      '*I love you. More than this whole little world I made could ever hold.'
    ],
    close: 'Keep it in my heart ♡'
  },

  /* ---------- Our Future ---------- */
  future: {
    title: 'More Memories Waiting For Us',
    lines: [
      'More places to discover.',
      'More food to try.',
      'More games to play.',
      'More random adventures.',
      'More memories to make.',
      'More versions of us.'
    ],
    lead: 'And hopefully…',
    last: 'a lifetime of them.'
  },

  /* ---------- The Love Letter ---------- */
  letter: {
    date: '6th Monthsary ♡',
    salutation: 'My Dearest Love,',
    paragraphs: [
      'Six months ago, something quietly shifted in the world when I found you. Or maybe when you found me. I\'m still not sure who found who first, but I know it was one of the most beautiful accidents of my life.',
      'You\'ve been my calm in the middle of chaos, my reason to laugh on the longest days, and the warmth I reach for when everything feels a little too cold. With you, ordinary moments feel like magic — a random Tuesday, a shared snack, a quiet evening. Everything is softer when you\'re in it.',
      'Thank you for staying. For choosing me, over and over. For being gentle with my heart. For making this the most beautiful six months I\'ve ever lived.',
      'Here\'s to more months, more memories, more laughs, and more of us.'
    ],
    closing: 'Sincere, your man,',
    afterTitle: 'Happy Monthsary, Nicole\u00a0❤️',
    afterSign: '— from your favorite human'
  },

  /* ---------- Ending ---------- */
  ending: {
    text: 'You are my favorite story, my softest chapter, my most cherished person. Here\'s to forever exploring this love with you.',
    love: 'I love you. ♡',
    more: 'More memories to come…'
  }
};
