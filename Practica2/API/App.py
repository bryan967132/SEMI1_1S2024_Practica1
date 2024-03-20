from Controller import Controller
from flask import Flask, jsonify, request
from flask_cors import CORS
# import os

app = Flask(__name__)
CORS(app)

ctrlr = Controller()

@app.route('/', methods=['GET'])
def running():
    return jsonify({'response': 'Server is running!!!'})

# LOGIN
@app.route('/login', methods=['POST'])
def login():
    body = request.json
    return ctrlr.login(body["usuario"], body["contrasena"])

# LOGOUT
@app.route('/logout', methods=['POST'])
def logout():
    body = request.json
    return ctrlr.logout(body["usuario"])

# SIGNIN
@app.route('/signin', methods=['POST'])
def signin():
    body = request.json
    return ctrlr.signin(body["usuario"], body["nombre"], body["contrasena"], body["foto"])

# PÁGINA DE INICIO | EDITAR PERFIL (PARA VISUALIZAR INFORMACIÓN)
@app.route('/home/<usuario>', methods=['GET'])
def home(usuario):
    usuario = str(usuario).replace('%20', ' ')
    return ctrlr.home(usuario)

# EDITAR PERFIL (BOTÓN)
@app.route('/edituser', methods=['PUT'])
def edituser():
    body = request.json
    return ctrlr.edituser(body["id_usuario"], body["usuario_nuevo"], body["nombre"], body["contrasena"], body["foto"])

# NOMBRES DE ALBUMES DE USUARIO (PARA SELECT)
@app.route('/getalbumname/<usuario>', methods=["GET"])
def getalbumname(usuario):
    usuario = str(usuario).replace('%20', ' ')
    return ctrlr.getalbumname(usuario)

# VER FOTOS
@app.route('/getalbumes/<usuario>', methods=["GET"])
def getalbumes(usuario):
    usuario = str(usuario).replace('%20', ' ')
    return ctrlr.getalbumes(usuario)

# VER FOTOS POR ALBUM
@app.route('/getalbumesfotos/<usuario>/<album>', methods=["GET"])
def getalbumesfotos(usuario, album):
    usuario = str(usuario).replace('%20', ' ')
    album = str(album).replace('%20', ' ')
    return ctrlr.getalbumesfotos(usuario, album)

# CARGAR FOTOS
@app.route('/uploadphoto', methods=["POST"])
def uploadphoto():
    body = request.json
    return ctrlr.uploadphoto(body["usuario"], body["nombre_foto"], body["nombre_album"], body["foto"])

# CREAR ALBUM
@app.route('/newalbum', methods=["POST"])
def newalbum():
    body = request.json
    return ctrlr.newalbum(body["usuario"], body["nombre_album"])

# EDITAR ALBUM
@app.route('/editalbum', methods=["PUT"])
def editalbum():
    body = request.json
    return ctrlr.editalbum(body["usuario"], body["nombre_album_actual"], body["nombre_album"])

# ELIMINAR ALBUM
@app.route('/deletealbum', methods=["DELETE"])
def deletealbum():
    body = request.json
    return ctrlr.deletealbum(body["usuario"], body["nombre_album"])

# ANALIZAR FOTO-TEXTO
@app.route('/phototext', methods=["POST"])
def PhotoText():
    body = request.json
    return ctrlr.PhotoText(body["photo"])

# CARGAR FOTOS
@app.route('/uploadphotoo', methods=["POST"])
def uploadphotoo():
    body = request.json
    return ctrlr.uploadphotoo(body["usuario"], body["nombre_foto"], body["descripcion"], body["foto"])


if __name__ == '__main__':
    # os.system('clear')
    app.run(host='0.0.0.0', debug = True, port = 4000)