import {Request, Response} from 'express';
import pool from '../database'; // conexion base de datos
import { Encriptar } from '../utilidades';

class IndexController{

    //POST: /login
    public async Login(req: Request, res: Response): Promise<void> {
        try {
            const  usuario  = req.body.usuario;
            const  contrasena  = Encriptar(req.body.contrasena);
            pool.query(
                'SELECT u.*, i.photo FROM USER u LEFT JOIN ALBUM a ON u.id = a.userId LEFT JOIN IMAGE i ON a.id = i.albumId WHERE u.user = ? AND u.pass = ? ORDER BY i.id DESC LIMIT 1;',
                [usuario,contrasena], (error, results) => {
                if (results && results.length > 0) {
                    pool.query(
                        'UPDATE USER SET activo = 1 WHERE user = ? AND pass = ?;',
                        [usuario,contrasena]
                        );
                    res.json(results[0]);
                }else {
                    res.status(401).json({ mensaje: 'Usuario o Contraseña Incorrectos' }); 
                }
            });
        } catch (error) {
            res.status(500).json({ mensaje: 'Error en el proceso de inicio de sesión' });
        }
    }

    //POST: /logout
    public async CerrarSesion(req: Request, res: Response):Promise<void>{
        try{
            const usuario = req.body.usuario;
            const UpdateUser = 'UPDATE USER SET activo = 0 WHERE user = ?;';
            
            pool.query(
                UpdateUser,
                [usuario],
                (error) => { 
                    if (error) {
                        res.status(500).json({ mensaje: 'Error al actulizar el usuario' });
                        return
                    }
                    res.json({mensaje: 'Usuario Actualizado'});    
                });
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
        }
    }
    
    //POST: /signin
    public async Registrar(req: Request, res: Response): Promise<void> {
        try {
            const  usuario  = req.body.usuario;
            const  nombre  = req.body.nombre;
            const  contrasena  = Encriptar(req.body.contrasena);
            const  foto  = req.body.foto; // tengo que subirla - aqui la recibo en base64
            const InsertUser = 'INSERT INTO USER (user, pass, fullName, activo) VALUES (?, ?, ?, ?);';
            const InsertAlbum = 'INSERT INTO ALBUM (albumName, userId) VALUES (?,?)';
            const InsertImage = 'INSERT INTO IMAGE (photo, albumId) VALUES (?, ?);';
            
            pool.query( //insert user
                InsertUser, 
                [usuario,contrasena,nombre,0], (error,userResult) => {
                    if (error){
                        res.status(500).json({ mensaje: 'Error en el proceso de registro de usuario' });
                        return
                    }
                    const userId = userResult.insertId;

                    pool.query( //insert album
                        InsertAlbum, 
                        ['Fotos de perfil',userId], (error,albumResult) => {
                            if (error){
                                res.status(500).json({ mensaje: 'Error en el proceso de registro de usuario' });
                                return
                            }
                            const albumId = albumResult.insertId;

                            pool.query( //insert foto de perfil
                                InsertImage, 
                                ['Fotos_Perfil/nueva_foto.jpg',albumId], (error) => {
                                    if (error){
                                        res.status(500).json({ mensaje: 'Error en el proceso de registro de usuario' });
                                        return
                                    }
                            }); 
                        });
                    res.json({ mensaje: 'Usuario Creado' })
            });
        } catch (error) {
            res.status(500).json({ mensaje: 'Error en el proceso de registro de usuario' });
        }
    }

    //GET: /home
    public async Home(req: Request, res: Response): Promise<void> {
        try {
            pool.query(
                'SELECT u.*, i.photo FROM USER u LEFT JOIN ALBUM a ON u.id = a.userId LEFT JOIN IMAGE i ON a.id = i.albumId WHERE u.activo = 1 ORDER BY i.id DESC LIMIT 1;',
                (error, results) => {
                if (results && results.length > 0) {
                    res.json(results);
                } else {
                    res.json({ mensaje: "Error: No se encontro el usuario" });
                }
            });
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al obtener usuarios' });
        }
    }

    //UPDATE: /edituser
    public async EditarUsuario(req: Request, res: Response):Promise<void>{
        try{
            const id_usuario = req.body.id_usuario;
            const usuario_nuevo = req.body.usuario_nuevo;
            const nombre = req.body.nombre;
            const contrasena = Encriptar(req.body.contrasena);
            const foto = req.body.foto;
            const UpdateUser = 'UPDATE USER SET user = ?, pass = ?, fullName = ? WHERE id = ?';
            
            pool.query(
                UpdateUser,
                [usuario_nuevo,contrasena,nombre,id_usuario],
                (error) => { 
                    if (error) {
                        res.status(500).json({ mensaje: 'Error al actulizar el usuario' });
                        return
                    }
                    res.json({mensaje: 'Usuario Actualizado'});    
                });
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
        }
    }

    //POST: /uploadphoto
    public async SubirFoto(req: Request, res: Response):Promise<void>{
        try{
            const usuario = req.body.usuario;
            const nombre_foto = req.body.nombre_foto;
            const nombre_album = req.body.nombre_album;
            const foto = req.body.foto; // la recibo en base64 
            const InsertFoto = '';
            
            pool.query(
                InsertFoto,
                [],
                (error) => { 
                    if (error) {
                        res.status(500).json({ mensaje: 'Error al insertar la foto' });
                        return
                    }
                    res.json({mensaje: 'Foto insertada'});    
                });
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
        }
    }

    //POST: /newalbum
    public async NuevoAlbum(req: Request, res: Response):Promise<void>{
        try{
            const usuario = req.body.usuario;
            const nombre_album = req.body.nombre_album;
            const NuevoAlbum = 'INSERT INTO ALBUM (albumName, userId) SELECT ?, id FROM USER WHERE user = ?;';
            
            pool.query(
                NuevoAlbum,
                [nombre_album,usuario],
                (error) => { 
                    if (error) {
                        res.status(500).json({ mensaje: 'Error al crear un nuevo album' });
                        return
                    }
                    res.json({mensaje: 'Album creado exitosamente'});    
                });
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al crear un nuevo album' });
        }
    }

    //UPDATE: /editalbum
    public async EditarAlbum(req: Request, res: Response):Promise<void>{
        try{
            const id_usuario = req.body.id_usuario;
            const id_album = req.body.id_album;
            const nombre_album_nuevo = req.body.nombre_album_nuevo;
            const EditarAlbum = 'UPDATE ALBUM SET albumName = ? WHERE userId = ? AND id = ?;';
            
            pool.query(
                EditarAlbum,
                [nombre_album_nuevo,id_usuario,id_album],
                (error) => { 
                    if (error) {
                        res.status(500).json({ mensaje: 'Error al editar el album' });
                        return
                    }
                    res.json({mensaje: 'Album editado exitosamente'});    
                });
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al editar el album' });
        }
    }


    //DELETE: /deletealbum
    public async EliminarAlbum(req: Request, res: Response):Promise<void>{
        try{
            const usuario = req.body.usuario;
            const nombre_album = req.body.nombre_album;
            const EliminarAlbum = 'DELETE a FROM ALBUM a INNER JOIN USER u ON a.userId = u.id  WHERE u.user = ? AND a.albumName = ?;';

            pool.query(
                EliminarAlbum,
                [usuario,nombre_album],
                (error) => { 
                    if (error) {
                        res.status(500).json({ mensaje: 'Error al eliminar el album' });
                        return
                    }
                    res.json({mensaje: 'Album eliminado exitosamente'});    
                });
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al eliminar el album' });
        }
    }

    //GET /getalbumname - (Para select de albumes):
    public async GetAlbums(req: Request, res: Response): Promise<void> {
        try {
            const usuario = req.body.usuario;


            pool.query(
                'SELECT a.* FROM ALBUM a INNER JOIN USER u ON a.userId = u.id  WHERE u.user = ?;',
                [usuario],(error, results) => {
                    if (error) {
                        res.status(500).json({ mensaje: 'Error al obtener los albums' });
                        return
                    }
                    if (results && results.length > 0) {
                        res.json(results);
                    } else {
                        res.json({ mensaje: "No se encontraron albums" });
                    }
            });
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al obtener usuarios' });
        }
    }

    //GET: /getalbumes
    public async GetAlbumsFoto(req: Request, res: Response): Promise<void> {
        try {
            const usuario = req.body.usuario;


            pool.query(
                'SELECT a.albumName, i.photo FROM ALBUM a INNER JOIN USER u ON a.userId = u.id LEFT JOIN IMAGE i ON a.id = i.albumId WHERE u.user = ?;',
                [usuario],(error, results) => {
                    if (error) {
                        res.status(500).json({ mensaje: 'Error al obtener los albums' });
                        return
                    }
                    if (results && results.length > 0) {
                        res.json({"albumes": results});
                    } else {
                        res.json({ mensaje: "No se encontraron albums" });
                    }
            });
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al obtener usuarios' });
        }
    }


    public async GetUsuario(req: Request, res: Response): Promise<void> {
        try {
            pool.query('SELECT * FROM USER', (error, results) => {
                if (results && results.length > 0) {
                    res.json({"albumes": results});
                } else {
                    res.json({ mensaje: "No se encontraron usuarios" });
                }
            });
        } catch (error) {
            res.status(500).json({ mensaje: 'Error al obtener usuarios' });
        }
    }

}

export const indexController = new IndexController();