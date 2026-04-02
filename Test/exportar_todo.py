import os
from datetime import datetime

# ================= CONFIGURACIÓN =================
# Carpetas a IGNORAR (no se exportarán)
IGNORE_FOLDERS = {
    '__pycache__', '.git', '.vscode', '.idea', 'node_modules', 
    'venv', 'env', '.venv', 'dist', 'build', 
    '.pytest_cache', '.mypy_cache', '.coverage'
}

# Extensiones de archivo a IGNORAR
IGNORE_EXTENSIONS = {
    '.pyc', '.pyo', '.pyd', '.so', '.dll', '.exe', 
    '.bin', '.log', '.sqlite', '.db', '.DS_Store', 
    '.gitignore', '.jpg', '.jpeg', '.png', '.gif', 
    '.ico', '.pdf', '.zip', '.rar', '.tar', '.gz'
}

# Nombre del archivo de salida
OUTPUT_FILE = 'proyecto_exportado.txt'
# =================================================

def get_file_size(filepath):
    """Devuelve el tamaño del archivo en formato legible"""
    try:
        size = os.path.getsize(filepath)
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size/1024:.1f} KB"
        else:
            return f"{size/(1024*1024):.1f} MB"
    except:
        return "0 B"

def should_ignore(filepath, filename):
    """Verifica si el archivo debe ignorarse"""
    # Ignorar archivos que empiezan con .
    if filename.startswith('.') and filename not in ['.env', '.env.example']:
        return True
    
    # Ignorar extensiones
    _, ext = os.path.splitext(filename)
    if ext.lower() in IGNORE_EXTENSIONS:
        return True
    
    # Intentar leer como texto (si falla, es binario)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            f.read(100)
        return False
    except:
        return True

def export_project():
    """Exporta estructura y contenido a un archivo .txt"""
    
    root_path = '.'
    archivos_validos = []
    
    # Recopilar todos los archivos válidos
    for raiz, dirs, files in os.walk(root_path):
        # Filtrar carpetas ignoradas
        dirs[:] = [d for d in dirs if d not in IGNORE_FOLDERS and not d.startswith('.')]
        
        for archivo in files:
            ruta_completa = os.path.join(raiz, archivo)
            ruta_rel = os.path.relpath(ruta_completa, root_path)
            
            # Saltar el propio archivo de exportación
            if archivo == OUTPUT_FILE:
                continue
            
            if not should_ignore(ruta_completa, archivo):
                archivos_validos.append((ruta_rel, ruta_completa))
    
    # Ordenar archivos
    archivos_validos.sort(key=lambda x: x[0])
    
    # Escribir en el archivo de salida
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        # CABECERA
        f.write("╔" + "═" * 78 + "╗\n")
        f.write("║" + " EXPORTACIÓN COMPLETA DEL PROYECTO ".center(78) + "║\n")
        f.write("╚" + "═" * 78 + "╝\n")
        f.write(f"\n📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"📂 Ruta: {os.path.abspath(root_path)}\n")
        f.write(f"📊 Total archivos: {len(archivos_validos)}\n")
        
        # ESTRUCTURA DE CARPETAS
        f.write("\n" + "═" * 80 + "\n")
        f.write("🌳 ESTRUCTURA DE ARCHIVOS\n")
        f.write("═" * 80 + "\n\n")
        
        for ruta_rel, ruta_completa in archivos_validos:
            size = get_file_size(ruta_completa)
            f.write(f"📄 {ruta_rel} ({size})\n")
        
        # CONTENIDO DE ARCHIVOS
        f.write("\n" + "═" * 80 + "\n")
        f.write("📝 CONTENIDO DE ARCHIVOS\n")
        f.write("═" * 80 + "\n")
        
        for ruta_rel, ruta_completa in archivos_validos:
            f.write("\n" + "─" * 80 + "\n")
            f.write(f"📄 ARCHIVO: {ruta_rel}\n")
            f.write("─" * 80 + "\n\n")
            
            try:
                with open(ruta_completa, 'r', encoding='utf-8') as archivo:
                    contenido = archivo.read()
                    f.write(contenido)
            except Exception as e:
                f.write(f"[ERROR AL LEER: {str(e)}]")
            
            f.write("\n")
        
        # PIE
        f.write("\n" + "═" * 80 + "\n")
        f.write("✅ FIN DE LA EXPORTACIÓN\n")
        f.write("═" * 80 + "\n")
    
    # Mensaje final en consola
    print("\n" + "✅" * 40)
    print(f"✅ ¡Exportación completada con éxito!")
    print(f"✅ Archivo creado: {OUTPUT_FILE}")
    print(f"✅ Total de archivos exportados: {len(archivos_validos)}")
    print("✅" * 40 + "\n")
    print(f"👉 Ahora abre '{OUTPUT_FILE}', copia TODO el contenido y pégalo en el chat.")

if __name__ == "__main__":
    export_project()