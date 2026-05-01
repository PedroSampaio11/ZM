const { Client } = require('pg');

const connectionString = "postgresql://dpipnkwvcomwlldlllnx:wtVhR%24%40a5p93X3m@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const client = new Client({
  connectionString: connectionString,
});

client.connect()
  .then(() => {
    console.log('Connected successfully!');
    return client.query('SELECT now()');
  })
  .then(res => {
    console.log('Result:', res.rows[0]);
    return client.end();
  })
  .catch(err => {
    console.error('Connection error:', err.message);
    process.exit(1);
  });
