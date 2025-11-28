#!/bin/bash

# Script de deploy a Vercel
# Este script hace commit y push a la rama development

echo "========== INICIANDO DEPLOY =========="

# Verificar estado de git
echo "[1/4] Verificando estado de git..."
git status

# Agregar cambios
echo "[2/4] Agregando cambios..."
git add -A

# Hacer commit
echo "[3/4] Haciendo commit..."
git commit -m "feat: habilitar reCAPTCHA, mejorar logs, agregar monitoreo automatizado, actualizar link iOS IPA"

# Push a rama development
echo "[4/4] Haciendo push a rama development..."
git push origin development

echo "========== DEPLOY COMPLETADO =========="
echo "Los cambios han sido enviados a la rama development"
echo "Vercel debería detectar los cambios automáticamente"
