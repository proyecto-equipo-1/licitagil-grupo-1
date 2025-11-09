#!/bin/bash

# Script de Verificación del Entorno para Jenkins (Linux/Mac)
# Este script verifica que todos los requisitos estén instalados

echo "🔍 Verificando Requisitos para Jenkins CI/CD..."
echo ""

all_good=true

# Verificar Node.js
echo -n "Verificando Node.js... "
if command -v node &> /dev/null; then
    node_version=$(node --version)
    major_version=$(echo $node_version | cut -d'.' -f1 | sed 's/v//')
    if [ "$major_version" -ge 20 ]; then
        echo "✅ $node_version"
    else
        echo "❌ Versión $node_version (se requiere v20+)"
        all_good=false
    fi
else
    echo "❌ No instalado"
    all_good=false
fi

# Verificar npm
echo -n "Verificando npm... "
if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo "✅ $npm_version"
else
    echo "❌ No instalado"
    all_good=false
fi

# Verificar Git
echo -n "Verificando Git... "
if command -v git &> /dev/null; then
    git_version=$(git --version)
    echo "✅ $git_version"
else
    echo "❌ No instalado"
    all_good=false
fi

# Verificar Docker
echo -n "Verificando Docker... "
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    echo "✅ $docker_version"
else
    echo "⚠️  No instalado (opcional)"
fi

# Verificar Docker Compose
echo -n "Verificando Docker Compose... "
if command -v docker-compose &> /dev/null; then
    compose_version=$(docker-compose --version)
    echo "✅ $compose_version"
else
    echo "⚠️  No instalado (opcional)"
fi

# Verificar Java
echo -n "Verificando Java... "
if command -v java &> /dev/null; then
    java_version=$(java -version 2>&1 | head -n 1)
    echo "✅ $java_version"
else
    echo "⚠️  No instalado (requerido para Jenkins local)"
fi

# Verificar PostgreSQL
echo -n "Verificando PostgreSQL... "
if command -v psql &> /dev/null; then
    pg_version=$(psql --version)
    echo "✅ $pg_version"
else
    echo "⚠️  No instalado (puede usar Docker)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar archivos del proyecto
echo ""
echo "📁 Verificando Estructura del Proyecto..."
echo ""

required_files=(
    "Jenkinsfile"
    "package.json"
    "api/package.json"
    "web/package.json"
    "docker-compose.yml"
)

for file in "${required_files[@]}"; do
    echo -n "Verificando $file... "
    if [ -f "$file" ]; then
        echo "✅"
    else
        echo "❌ No encontrado"
        all_good=false
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$all_good" = true ]; then
    echo "✅ Todos los requisitos esenciales están instalados!"
    echo ""
    echo "🚀 Próximos pasos:"
    echo "   1. Instalar Jenkins (ver docs/JENKINS_SETUP.md)"
    echo "   2. Configurar credenciales en Jenkins"
    echo "   3. Crear pipeline job en Jenkins"
    echo "   4. Configurar webhook en GitHub"
    echo "   5. Configurar notificaciones de Slack"
else
    echo "❌ Faltan algunos requisitos esenciales"
    echo ""
    echo "📖 Consulta la documentación en docs/JENKINS_SETUP.md"
fi

echo ""
