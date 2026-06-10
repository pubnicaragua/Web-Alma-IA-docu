#!/usr/bin/env node

/**
 * Health Check Script - Prueba de Login Automatizada
 * Ejecuta pruebas de login diarias y envía reportes por email
 * 
 * Uso: node scripts/health-check.js
 */

const nodemailer = require('nodemailer');
const https = require('https');

// Configuración
const CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.1.30:3001/api/v1',
  MAIL_HOST: process.env.MAIL_HOST || 'smtp.gmail.com',
  MAIL_PORT: process.env.MAIL_PORT || 587,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  MAIL_FROM: process.env.MAIL_FROM || 'noreply@almaia.cl',
  RECIPIENTS: (process.env.HEALTH_CHECK_RECIPIENTS || '').split(',').filter(Boolean),
  TEST_USERS: [
    // Agregar usuarios de prueba aquí
    // { email: 'user1@example.com', password: 'password1' },
    // { email: 'user2@example.com', password: 'password2' },
  ]
};

// Logger
const log = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
  success: (msg) => console.log(`[✓] ${new Date().toISOString()} - ${msg}`),
};

/**
 * Realiza una petición HTTPS
 */
function httpsRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
            rawBody: body
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * Prueba login de un usuario
 */
async function testUserLogin(email, password) {
  const startTime = Date.now();
  
  try {
    log.info(`Probando login para: ${email}`);

    const url = new URL(`${CONFIG.API_URL}/auth/login`);
    const response = await httpsRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, {
      identifier: email,
      password: password
    });

    const duration = Date.now() - startTime;

    if (response.status === 200 && response.body?.token) {
      log.success(`Login exitoso para ${email} (${duration}ms)`);
      return {
        success: true,
        email,
        duration,
        message: 'Login exitoso'
      };
    } else {
      log.error(`Login fallido para ${email} - Status: ${response.status}`);
      return {
        success: false,
        email,
        duration,
        status: response.status,
        message: response.body?.message || response.rawBody || 'Error desconocido'
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    log.error(`Error al probar login para ${email}: ${error.message}`);
    return {
      success: false,
      email,
      duration,
      error: error.message
    };
  }
}

/**
 * Prueba la disponibilidad del API
 */
async function testAPIHealth() {
  try {
    log.info('Verificando salud del API...');
    const url = new URL(`${CONFIG.API_URL}/auth/login`);
    
    const response = await httpsRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, {
      identifier: 'test@test.com',
      password: 'test'
    });

    if (response.status >= 200 && response.status < 500) {
      log.success('API está disponible');
      return { available: true, status: response.status };
    } else {
      log.error(`API retornó status: ${response.status}`);
      return { available: false, status: response.status };
    }
  } catch (error) {
    log.error(`API no disponible: ${error.message}`);
    return { available: false, error: error.message };
  }
}

/**
 * Envía reporte por email
 */
async function sendReport(results) {
  if (!CONFIG.MAIL_USER || !CONFIG.MAIL_PASS || CONFIG.RECIPIENTS.length === 0) {
    log.error('Configuración de email incompleta. Saltando envío de reporte.');
    return;
  }

  try {
    log.info('Enviando reporte por email...');

    const transporter = nodemailer.createTransport({
      host: CONFIG.MAIL_HOST,
      port: CONFIG.MAIL_PORT,
      secure: CONFIG.MAIL_PORT === 465,
      auth: {
        user: CONFIG.MAIL_USER,
        pass: CONFIG.MAIL_PASS
      }
    });

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const timestamp = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });

    const htmlContent = `
      <h2>Reporte de Salud - Web Alma IA</h2>
      <p><strong>Fecha/Hora:</strong> ${timestamp} (Zona: America/Santiago)</p>
      
      <h3>Resumen</h3>
      <ul>
        <li><strong>Total de pruebas:</strong> ${results.length}</li>
        <li><strong style="color: green;">✓ Exitosas:</strong> ${successCount}</li>
        <li><strong style="color: red;">✗ Fallidas:</strong> ${failureCount}</li>
      </ul>

      <h3>Detalles</h3>
      <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f2f2f2;">
          <th>Email</th>
          <th>Estado</th>
          <th>Duración</th>
          <th>Mensaje</th>
        </tr>
        ${results.map(r => `
          <tr>
            <td>${r.email}</td>
            <td style="color: ${r.success ? 'green' : 'red'};">
              ${r.success ? '✓ Exitoso' : '✗ Fallido'}
            </td>
            <td>${r.duration}ms</td>
            <td>${r.message || r.error || 'N/A'}</td>
          </tr>
        `).join('')}
      </table>

      <hr>
      <p style="font-size: 12px; color: #666;">
        Este es un reporte automático generado por el sistema de monitoreo de Web Alma IA.
      </p>
    `;

    const mailOptions = {
      from: CONFIG.MAIL_FROM,
      to: CONFIG.RECIPIENTS.join(','),
      subject: `[${failureCount > 0 ? '⚠️ ALERTA' : '✓ OK'}] Reporte de Salud - Web Alma IA - ${timestamp}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    log.success(`Reporte enviado a: ${CONFIG.RECIPIENTS.join(', ')}`);
  } catch (error) {
    log.error(`Error al enviar reporte: ${error.message}`);
  }
}

/**
 * Función principal
 */
async function main() {
  log.info('========== INICIANDO HEALTH CHECK ==========');

  if (CONFIG.TEST_USERS.length === 0) {
    log.error('No hay usuarios de prueba configurados. Abortando.');
    process.exit(1);
  }

  // Verificar salud del API
  const apiHealth = await testAPIHealth();
  if (!apiHealth.available) {
    log.error('API no está disponible. Abortando pruebas.');
    process.exit(1);
  }

  // Ejecutar pruebas de login
  const results = [];
  for (const user of CONFIG.TEST_USERS) {
    const result = await testUserLogin(user.email, user.password);
    results.push(result);
  }

  // Enviar reporte
  await sendReport(results);

  log.info('========== HEALTH CHECK COMPLETADO ==========');

  // Retornar código de salida basado en resultados
  const hasFailures = results.some(r => !r.success);
  process.exit(hasFailures ? 1 : 0);
}

// Ejecutar
main().catch(error => {
  log.error(`Error fatal: ${error.message}`);
  process.exit(1);
});
