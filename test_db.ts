// test-db-connection.js
const mysql = require('mysql2/promise');

async function test() {
  console.log('🔍 Тестируем подключение к MySQL...');
  
  const connection = await mysql.createConnection({
    host: '217.18.61.163',
    port: 3306,
    user: 'gen_user',
    password: 'gwgQAW5avVrV:.', // замените на реальный
    database: 'spectech'
  });
  
  try {
    // 1. Проверяем подключение
    await connection.ping();
    console.log('✅ MySQL подключен');
    
    // 2. Проверяем таблицы
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Таблицы:', tables.map(t => Object.values(t)[0]));
    
    // 3. Проверяем таблицу users
    const [usersColumns] = await connection.execute('DESCRIBE users');
    console.log('🗂️  Структура users:', usersColumns.map(c => ({
      field: c.Field,
      type: c.Type,
      nullable: c.Null === 'YES'
    })));
    
    // 4. Проверяем существующих пользователей
    const [existingUsers] = await connection.execute('SELECT * FROM users');
    console.log(`👥 Пользователей в базе: ${existingUsers.length}`);
    
    // 5. Пробуем вставить тестового пользователя
    const [insertResult] = await connection.execute(
      `INSERT INTO users (telegram_id, first_name, last_login, login_count, balance, role) 
       VALUES (?, ?, NOW(), 1, 0, 'user')`,
      ['test_user_123', 'Тестовый']
    );
    console.log('✅ Тестовый пользователь добавлен, ID:', insertResult.insertId);
    
    // 6. Удаляем тестового
    await connection.execute('DELETE FROM users WHERE telegram_id = ?', ['test_user_123']);
    console.log('🧹 Тестовый пользователь удалён');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error('Код ошибки:', error.code);
  } finally {
    await connection.end();
  }
}

test();