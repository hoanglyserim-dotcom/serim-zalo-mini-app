-- Dữ liệu mẫu CHỈ để test trên máy (local). Không chạy file này trên database thật.
INSERT OR IGNORE INTO users (id, zalo_user_id, employee_code, display_name) VALUES
  (1, 'dev-zalo-A', 'SR001', 'Nhân viên A (Chủ)'),
  (2, 'dev-zalo-B', 'SR002', 'Nhân viên B'),
  (3, 'dev-zalo-C', 'SR003', 'Nhân viên C (ngoài nhóm)'),
  (4, NULL,         'SR004', 'Nhân viên D (chưa liên kết)');
INSERT OR IGNORE INTO groups (id, name, type, created_by) VALUES (1, 'Core Team', 'core', 1);
INSERT OR IGNORE INTO group_members (group_id, user_id, role) VALUES (1, 1, 'owner'), (1, 2, 'member');
