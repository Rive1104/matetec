export type Player = {
    id: number;
    name: string;
    age: number;
    sexo: string;
    puntuacion?: number; // <-- ¡SOLUCIÓN!: Agregamos esta propiedad como opcional (?)
};

// Objeto Singleton que contiene la lógica de datos
export const datosStore = {
    // Propiedades internas
    _STORAGE_KEY: 'matetec_player_list' as const,
    _userList: [] as Player[],
    _nextId: 1,

    // Métodos privados
    _saveToLocalStorage() {
        localStorage.setItem(this._STORAGE_KEY, JSON.stringify(this._userList));
    },

    _createInitialData(): Player[] {
        return [
            { id: 1, name: 'Jugador Ejemplo 1', age: 10, sexo: 'Masculino', puntuacion: 5000 },
            { id: 2, name: 'Jugador Ejemplo 2', age: 12, sexo: 'Femenino', puntuacion: 3200 },
        ];
    },

    // Método para cargar datos iniciales
    loadInitialData(): void {
        const storedUsers = localStorage.getItem(this._STORAGE_KEY);
        
        if (storedUsers) {
            this._userList = JSON.parse(storedUsers);
            const maxId = this._userList.reduce((max, user) => (user.id > max ? user.id : max), 0);
            this._nextId = maxId + 1;
        } else {
            this._userList = this._createInitialData();
            this._nextId = 3;
            this._saveToLocalStorage();
        }
    },

    // Métodos públicos
    getUsers(): Player[] {
        return this._userList;
    },
    
    getUserById(id: number): Player | undefined {
        if (this._userList.length === 0) {
            this.loadInitialData();
        }
        return this._userList.find(user => user.id === id);
    },

    addUser(user: Omit<Player, 'id'>): Player { 
        const newUser: Player = {
            ...user,
            id: this._nextId++
        };
        this._userList.push(newUser);
        this._saveToLocalStorage();
        return newUser;
    },

    updateUser(updatedUser: Player): void {
        const index = this._userList.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
            this._userList[index] = updatedUser;
            this._saveToLocalStorage();
        }
    },

    deleteUser(id: number): void {
        this._userList = this._userList.filter(user => user.id !== id);
        this._saveToLocalStorage();
    }
};