import { jest } from '@jest/globals';

const UserMock = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
};

const bcryptMock = {
    hash: jest.fn(),
    compare: jest.fn()
};

const jwtMock = {
    sign: jest.fn()
};

await jest.unstable_mockModule('../models/user.model.js', () => ({ default: UserMock }));
await jest.unstable_mockModule('bcrypt', () => ({ default: bcryptMock }));
await jest.unstable_mockModule('jsonwebtoken', () => ({ default: jwtMock }));

const { default: userService } = await import('../services/user.service.js');

describe('User Service', () => {
    beforeEach(() => jest.clearAllMocks());

    test('create should hash password and create user', async () => {
        const input = { username: 'u1', names: 'N', lastnames: 'L', email: 'e', password: 'p', role: 'user' };
        UserMock.findOne.mockResolvedValue(null);
        bcryptMock.hash.mockResolvedValue('hashed');
        UserMock.create.mockResolvedValue({ id_user: 10, username: input.username, names: input.names, lastnames: input.lastnames, email: input.email, role: input.role });

        const res = await userService.create(input);

        expect(UserMock.findOne).toHaveBeenCalledWith({ where: { username: input.username } });
        expect(bcryptMock.hash).toHaveBeenCalledWith(input.password, 10);
        expect(UserMock.create).toHaveBeenCalled();
        expect(res).toHaveProperty('username', input.username);
    });

    test('login should return token when credentials valid', async () => {
        const input = { username: 'u1', password: 'p' };
        UserMock.findOne.mockResolvedValue({ id_user: 11, username: input.username, password: 'hashed' });
        bcryptMock.compare.mockResolvedValue(true);
        jwtMock.sign.mockReturnValue('token123');

        const res = await userService.login(input);
        expect(UserMock.findOne).toHaveBeenCalledWith({ where: { username: input.username } });
        expect(bcryptMock.compare).toHaveBeenCalledWith(input.password, 'hashed');
        expect(res).toHaveProperty('token');
    });

    test('login should throw on invalid password', async () => {
        const input = { username: 'u1', password: 'p' };
        UserMock.findOne.mockResolvedValue({ id_user: 11, username: input.username, password: 'hashed' });
        bcryptMock.compare.mockResolvedValue(false);
        await expect(userService.login(input)).rejects.toThrow('Contraseña incorrecta');
    });

    test('update should throw if user not found', async () => {
        UserMock.findByPk.mockResolvedValue(null);
        await expect(userService.update(999, {})).rejects.toThrow('Usuario no encontrado');
    });

    test('remove should delete user', async () => {
        UserMock.destroy.mockResolvedValue(1);
        const res = await userService.remove(5);
        expect(UserMock.destroy).toHaveBeenCalledWith({ where: { id_user: 5 } });
        expect(res).toHaveProperty('message', 'Usuario eliminado');
    });
});
