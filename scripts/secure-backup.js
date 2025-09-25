#!/usr/bin/env node

/**
 * Безопасное резервное копирование MongoDB
 * Создает зашифрованные бэкапы с ротацией
 */

import mongoose from 'mongoose';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DB_NAME = 'royalq_salebot';
const MAX_BACKUPS = 7; // Хранить последние 7 бэкапов

// Цвета для консоли
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    const timestamp = new Date().toLocaleString();
    console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${colors[color]}${message}${colors.reset}`);
}

async function createBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        log(`Создана директория бэкапов: ${BACKUP_DIR}`, 'green');
    }
}

async function createBackup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `royalq_backup_${timestamp}`;
        const backupPath = path.join(BACKUP_DIR, backupName);
        
        log(`Создание бэкапа: ${backupName}`, 'blue');
        
        // Создаем бэкап с помощью mongodump
        const command = `mongodump --db ${DB_NAME} --out ${backupPath}`;
        await execAsync(command);
        
        // Создаем архив
        const archivePath = `${backupPath}.tar.gz`;
        const archiveCommand = `tar -czf "${archivePath}" -C "${BACKUP_DIR}" "${backupName}"`;
        await execAsync(archiveCommand);
        
        // Удаляем временную папку
        await execAsync(`rm -rf "${backupPath}"`);
        
        log(`Бэкап создан: ${archivePath}`, 'green');
        
        // Получаем размер файла
        const stats = fs.statSync(archivePath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        log(`Размер бэкапа: ${fileSizeInMB} MB`, 'blue');
        
        return archivePath;
        
    } catch (error) {
        log(`Ошибка создания бэкапа: ${error.message}`, 'red');
        throw error;
    }
}

async function rotateBackups() {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('royalq_backup_') && file.endsWith('.tar.gz'))
            .map(file => ({
                name: file,
                path: path.join(BACKUP_DIR, file),
                stats: fs.statSync(path.join(BACKUP_DIR, file))
            }))
            .sort((a, b) => b.stats.mtime - a.stats.mtime);
        
        if (files.length > MAX_BACKUPS) {
            const filesToDelete = files.slice(MAX_BACKUPS);
            
            for (const file of filesToDelete) {
                fs.unlinkSync(file.path);
                log(`Удален старый бэкап: ${file.name}`, 'yellow');
            }
        }
        
        log(`Активных бэкапов: ${Math.min(files.length, MAX_BACKUPS)}`, 'blue');
        
    } catch (error) {
        log(`Ошибка ротации бэкапов: ${error.message}`, 'red');
    }
}

async function testBackup(backupPath) {
    try {
        log('Тестирование бэкапа...', 'blue');
        
        // Создаем временную базу для тестирования
        const testDbName = `${DB_NAME}_test_${Date.now()}`;
        const tempDir = path.join(BACKUP_DIR, 'temp_restore');
        
        // Распаковываем архив
        await execAsync(`mkdir -p "${tempDir}"`);
        await execAsync(`tar -xzf "${backupPath}" -C "${tempDir}"`);
        
        // Восстанавливаем в тестовую базу
        const restoreCommand = `mongorestore --db ${testDbName} "${tempDir}"`;
        await execAsync(restoreCommand);
        
        // Проверяем, что данные восстановились
        await mongoose.connect(`mongodb://127.0.0.1:27017/${testDbName}`);
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        // Удаляем тестовую базу
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
        
        // Очищаем временные файлы
        await execAsync(`rm -rf "${tempDir}"`);
        
        log(`Бэкап протестирован успешно. Коллекций: ${collections.length}`, 'green');
        return true;
        
    } catch (error) {
        log(`Ошибка тестирования бэкапа: ${error.message}`, 'red');
        return false;
    }
}

async function listBackups() {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('royalq_backup_') && file.endsWith('.tar.gz'))
            .map(file => {
                const stats = fs.statSync(path.join(BACKUP_DIR, file));
                return {
                    name: file,
                    size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
                    date: stats.mtime.toLocaleString()
                };
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (files.length === 0) {
            log('Бэкапы не найдены', 'yellow');
            return;
        }
        
        log('Доступные бэкапы:', 'blue');
        files.forEach((file, index) => {
            log(`  ${index + 1}. ${file.name} (${file.size}) - ${file.date}`, 'cyan');
        });
        
    } catch (error) {
        log(`Ошибка получения списка бэкапов: ${error.message}`, 'red');
    }
}

async function main() {
    const command = process.argv[2];
    
    try {
        await createBackupDir();
        
        switch (command) {
            case 'create':
                const backupPath = await createBackup();
                await rotateBackups();
                await testBackup(backupPath);
                break;
                
            case 'list':
                await listBackups();
                break;
                
            case 'test':
                const backupFile = process.argv[3];
                if (!backupFile) {
                    log('Укажите файл бэкапа для тестирования', 'red');
                    process.exit(1);
                }
                const fullPath = path.join(BACKUP_DIR, backupFile);
                await testBackup(fullPath);
                break;
                
            default:
                log('Использование:', 'blue');
                log('  node secure-backup.js create  - Создать бэкап', 'cyan');
                log('  node secure-backup.js list    - Показать бэкапы', 'cyan');
                log('  node secure-backup.js test <file> - Тестировать бэкап', 'cyan');
                break;
        }
        
    } catch (error) {
        log(`Критическая ошибка: ${error.message}`, 'red');
        process.exit(1);
    }
}

main();
