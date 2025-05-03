/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createTable('comments', {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      content: {
        type: 'TEXT',
        notNull: true,
      },
      owner: {
        type: 'VARCHAR(50)',
        notNull: true,
        references: '"users"',
        onDelete: 'cascade'
      },
      thread_id: {
        type: 'VARCHAR(50)',
        notNull: true,
        references: '"threads"',
        onDelete: 'cascade'
      },
      created_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('current_timestamp'),
      },
    });
    pgm.createIndex('comments', 'owner');
    pgm.createIndex('comments', 'thread_id');
  };
    
  exports.down = (pgm) => {
    pgm.dropTable('comments');
    pgm.dropIndex('comments', 'owner');
    pgm.dropIndex('comments', 'thread_id');
  };
    