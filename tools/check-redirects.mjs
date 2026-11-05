const baseUrl = process.argv[2] || 'http://127.0.0.1:3001';

const redirects = new Map([
  ...[
    'tanzania-safaris',
    'tanzania-safaris/tanzania-southern-circuit-safaris',
    'tanzania-safaris/honeymoon-safari-tanzania',
    'tanzania-safaris/asanja-7-nights-8-days-serengeti-safari',
    'tanzania-safaris/asanja-8-nights-9-days-serengeti-safari',
    'tanzania-safaris/asanja-6-nights-7-days-serengeti-safari',
    'tanzania-safaris/asanja-4-nights-5-days-serengeti-safari',
    'tanzania-safaris/serengeti-national-park-safaris',
    'tanzania-safaris/asanja-7-nights-8-days-tanzania-northern-circuit-safari',
    'tanzania-safaris/3-nights-4-days-serengeti-safari-moru',
    'tanzania-safaris/asanja-3-nights-4-days-serengeti-safari-grumeti',
    'tanzania-safaris/asanja-5-nights-6-days-serengeti-safari',
    'tanzania-safaris/asanja-6-nights-7-days-ruaha-national-park-safari',
    'tanzania-safaris/asanja-5-nights-6-days-ruaha-national-park-safari',
    'tanzania-safaris/asanja-6-nights-7-days-tanzania-northern-circuit-safari',
    'tanzania-safaris/asanja-5-nights-6-days-tanzania-northern-circuit-safari',
    'tanzania-safaris/asanja-4-nights-5-days-tanzania-northern-circuit-safari',
    'tanzania-safaris/asanja-9-nights-10-days-tanzania-northern-circuit-safari',
    'tanzania-safaris/tanzania-northern-circuit-safaris',
  ].map((source) => [source, '/safaris/']),
  ['my-account', '/'],
  ['checkout', '/'],
  ['video-gallery', '/'],
  ['contact-us', '/contact/'],
  ['flights', '/plan-my-stay/'],
  ['asanja-camps/asanja-nyasirori-camp', '/asanja-nyasirori/'],
  ['asanja-camps/asanja-moru-camp', '/asanja-moru/'],
  ['asanja-camps/asanja-ruaha-lodge', '/asanja-ruaha/'],
  ['asanja-camps/asanja-grumeti-camp', '/asanja-sri-bustani/'],
  ['asanja-camps', '/camps-and-lodges/'],
]);

const failures = [];
for (const [source, expected] of redirects) {
  const response = await fetch(`${baseUrl}/${source}/`, { redirect: 'manual' });
  const location = response.headers.get('location');
  if (response.status !== 301 || location !== expected) {
    failures.push({ source, expected, status: response.status, location });
  }
}

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
} else {
  console.log(`Checked ${redirects.size} historic redirects; all return the expected 301 target.`);
}
