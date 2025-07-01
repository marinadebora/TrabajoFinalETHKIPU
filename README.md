# 📄 Trabajo Final ETH-KIPU & HENRY  Token Farm

Este proyecto implementa un contrato inteligente de DeFi llamado **TokenFarm**, que permite a los usuarios hacer *staking* de un token LP ficticio y recibir recompensas en un token de la plataforma (**DAppToken**).

---

## ✨ Características principales

✅ **Depositar tokens LP**  
Los usuarios pueden depositar cualquier cantidad de LP Tokens. El contrato registra su balance en staking y actualiza su posición.

✅ **Recompensas proporcionales**  
Por cada bloque minado, se genera una recompensa total (por defecto `1 DAPP`). Cada usuario recibe recompensas proporcionales a su participación sobre el total de tokens en staking.

✅ **Reclamar recompensas acumuladas**  
Los usuarios pueden reclamar sus recompensas en cualquier momento. Al hacerlo:
- Se calcula la comisión de retiro.
- La comisión se transfiere a la tesorería.
- El usuario recibe los tokens netos.

✅ **Retiro del staking**  
Los usuarios pueden retirar el total de sus tokens LP en cualquier momento. Antes del retiro, se actualizan las recompensas pendientes.

✅ **Distribución de recompensas global**  
El propietario del contrato puede ejecutar `distributeRewardsAll` para actualizar las recompensas de todos los usuarios activos en staking en un solo llamado.

✅ **Modificar recompensa por bloque**  
El propietario puede actualizar el monto de recompensa que se genera por bloque.

✅ **Bonificaciones y seguridad**
- Verificación de direcciones no nulas.
- Validación de montos mayores a cero.
- *Modifiers* de acceso:
  - `onlyOwner`: funciones restringidas al propietario.
  - `userIsStaking`: asegura que el usuario tenga tokens en staking.
- Control de comisión al reclamar recompensas.
- Estructura `StructUser` que simplifica la gestión de balances, checkpoints y estado de staking.

---

## 🔧 Contratos involucrados

- **DAppToken**: Token ERC20 que se acuña como recompensa al hacer staking.
- **LPToken**: Token ERC20 que se deposita en staking.
- **TokenFarm**: Contrato principal que administra depósitos, cálculos y reclamos de recompensas.

---

## 🧠 Resumen de funcionamiento

1. El usuario deposita LP tokens con `deposit(amount)`.
2. El contrato actualiza su balance y checkpoint.
3. Cada vez que cambia el estado, se recalculan las recompensas pendientes.
4. El usuario puede:
   - Retirar todos sus LP tokens (`withdraw`).
   - Reclamar las recompensas acumuladas (`claimRewards`).
5. El owner puede:
   - Distribuir recompensas a todos (`distributeRewardsAll`).
   - Modificar la recompensa por bloque (`modifyReward`).
   - Retirar la comisión acumulada en la tesorería.

---

## 🚀 Despliegue

El contrato puede desplegarse en una red local o testnet (por ejemplo, Sepolia) usando **Hardhat**.

### 📦 Instalación
1. Clonar el repositorio
2. Ejecutar:
3. Crear un archivo .env en la raíz del proyecto con el siguiente contenido:
    ```bash  
    ALCHEMY_API_KEY=tu_api_key_de_alchemy
    ETHERSCAN_API_KEY=tu_api_key_de_etherscan
    SEPOLIA_PRIVATE_KEY=tu_private_key_de_sepolia
    OWNER=el_addres_de_la_wallet
    TREASURY=el_addres_de_la_wallet_tesoreria
    DAAPTOKEN=el_addres_del_contrato_DApToken
    LPTOKEN=el_addres_del_contrato_LPToken
    TOKENFARM=el_addres_del_contrato_TokenFarm
    ```
## ⚙️ Comandos útiles
### 🔧 Compilar contrato

     npx hardhat compile

### ✅ Ejecutar tests

    npx hardhat test
   

### 🚀 Deploy + Verificación en Sepolia

    npx hardhat ignition deploy ./ignition/modules/DAppToken.ts --network sepolia --verify

    npx hardhat ignition deploy ./ignition/modules/LPToken.ts --network sepolia --verify

    npx hardhat ignition deploy ./ignition/modules/TokenFarm.ts --network sepolia --verify

### 🔗 Contratos desplegados
  DAppToken  - https://sepolia.etherscan.io/address/0x7E1D57e997cA3061E60B7283E7e69f9113D4885c#code

  LPToken - https://sepolia.etherscan.io/address/0x5829B07c14fe29B798f14dB88b8Db25101C54950#code

  TokenFarm - https://sepolia.etherscan.io/address/0x06cac7b9F869b2c6D39991f10d7BC3220d303532#code