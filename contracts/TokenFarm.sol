// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
//Carabajal Marina Débora

pragma solidity ^0.8.27;

import "./DAppToken.sol";
import "./LPToken.sol";

/**
 * @title Proportional Token Farm
 * @notice Una granja de staking donde las recompensas se distribuyen proporcionalmente al total stakeado.
 */
contract TokenFarm {
    // Variables de estado
    address public treasury;
    string public name = "Proportional Token Farm";
    address public owner;
    DAppToken public dappToken;
    LPToken public lpToken;
    uint256 public fee;
    uint256 public REWARD_PER_BLOCK = 1e18; // Recompensa por bloque (total para todos los usuarios)
    uint256 public totalStakingBalance; // Total de tokens en staking
    uint256 public accruedFees;
    address[] public stakers;
    
    struct StructUser {
        uint256 stakingBalance;
        uint256 checkpoints;
        uint256 pendingRewards;
        bool hasStaked;
        bool isStaking;
    }

    mapping(address => StructUser) public structUser;
    // Eventos
    // Agregar eventos para Deposit, Withdraw, RewardsClaimed y RewardsDistributed.
    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDistributed(uint256 timestamp, string message);
    event NewReward(uint256 timestamp, string message);
    event CommissionWithdrawn(address indexed treasury, uint256 amount);
    event FeeChanged(uint256 timestamp, string message);
    //verifica que solo el owner pueda realizar la operación
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    // verifica que que el address no sea 0
    modifier approvedAddress() {
        require(msg.sender != address(0), "cannot be de zero address");
        _;
    }
    // verifica  que el value no sea 0
    modifier approvedAmount(uint256 _amount) {
        require(_amount > 0, "The amount must be greater than 0");
        _;
    }
    // verifica si el llamador de la funcion esta haciendo staking
    modifier userIsStaking() {
        require(structUser[msg.sender].isStaking, "you are not staking");
        _;
    }

    // Constructor
    constructor(DAppToken _dappToken, LPToken _lpToken, address _treasury) {
        // Configurar las instancias de los contratos de DappToken y LPToken.
        dappToken = _dappToken;
        lpToken = _lpToken;
        // Configurar al owner del contrato como el creador de este contrato.
        owner = msg.sender;
        // Inicializar la tesorería con la dirección proporcionada
        require(
            _treasury != address(0),
            "The treasury cannot be the zero address"
        );
        treasury = _treasury;
        fee = 200;
    }

    /**
     * @notice Deposita tokens LP para staking.
     * @param _amount Cantidad de tokens LP a depositar.
     */
    function deposit(
        uint256 _amount
    ) external approvedAddress approvedAmount(_amount) {
        // Verificar que _amount sea mayor a 0.
        // Transferir tokens LP del usuario a este contrato.
        lpToken.transferFrom(msg.sender, address(this), _amount);
        // Actualizar el balance de staking del usuario en stakingBalance.
        structUser[msg.sender].stakingBalance += _amount;
        // Incrementar totalStakingBalance con _amount.
        totalStakingBalance += _amount;
        // Si el usuario nunca ha hecho staking antes, agregarlo al array stakers y marcar hasStaked como true.
        if (!structUser[msg.sender].hasStaked) {
            stakers.push(msg.sender);
            structUser[msg.sender].hasStaked = true;
        }
        // Actualizar isStaking del usuario a true.
        structUser[msg.sender].isStaking = true;
        // Si checkpoints del usuario está vacío, inicializarlo con el número de bloque actual.
        if (structUser[msg.sender].checkpoints == 0) {
            structUser[msg.sender].checkpoints = block.number;
        } else {
            // Llamar a distributeRewards para calcular y actualizar las recompensas pendientes.
            distributeRewards(msg.sender);
        }
        // Emitir un evento de depósito.
        emit Deposit(msg.sender, _amount);
    }

    /**
     * @notice Retira todos los tokens LP en staking.
     */
    function withdraw() external approvedAddress userIsStaking {
        // Verificar que el usuario está haciendo staking (isStaking == true).
        uint256 userBalance;
        // Obtener el balance de staking del usuario.
        userBalance = structUser[msg.sender].stakingBalance;
        // Verificar que el balance de staking sea mayor a 0.
        require(userBalance > 0, "You cannot withdraw your balance is 0");
        // Llamar a distributeRewards para calcular y actualizar las recompensas pendientes antes de restablecer el balance.
        distributeRewards(msg.sender);
        // Restablecer stakingBalance del usuario a 0.
        structUser[msg.sender].stakingBalance = 0;
        // Reducir totalStakingBalance en el balance que se está retirando.
        totalStakingBalance -= userBalance;
        // Actualizar isStaking del usuario a false.
        structUser[msg.sender].isStaking = false;
        // Transferir los tokens LP de vuelta al usuario.
        lpToken.transfer(msg.sender, userBalance);
        // Emitir un evento de retiro.
        emit Withdrawal(userBalance);
    }

    /**
     * @notice Reclama recompensas pendientes.
     */
    function claimRewards() external approvedAddress {
        // Obtener el monto de recompensas pendientes del usuario desde pendingRewards.
        uint256 pendingAmount = structUser[msg.sender].pendingRewards;
        // Verificar que el monto de recompensas pendientes sea mayor a 0.
        require(pendingAmount > 0, "you have no rewards");
        // Restablecer las recompensas pendientes del usuario a 0.
        structUser[msg.sender].pendingRewards = 0;
        uint256 netAmount = deductCommission(pendingAmount);
        // Llamar a la función de acuñación (mint) en el contrato DappToken para transferir las recompensas al usuario.
        dappToken.mint(msg.sender, netAmount);
        // Emitir un evento de reclamo de recompensas.
        emit RewardsClaimed(msg.sender, netAmount);
    }

    /**
     * @notice Distribuye recompensas a todos los usuarios en staking.
     */
    function distributeRewardsAll() external onlyOwner {
        // Verificar que la llamada sea realizada por el owner.
        // Iterar sobre todos los usuarios en staking almacenados en el array stakers.
        for (uint256 index = 0; index < stakers.length; index++) {
            // Para cada usuario, si están haciendo staking (isStaking == true), llamar a distributeRewards.
            if (structUser[stakers[index]].isStaking) {
                distributeRewards(stakers[index]);
            }
        }
        // Emitir un evento indicando que las recompensas han sido distribuidas.
        emit RewardsDistributed(
            block.timestamp,
            "the rewards have been distributed"
        );
    }

    function distributeRewards(address beneficiary) private {
        // Obtener el último checkpoint del usuario desde checkpoints.
        uint256 userCheckpoint = structUser[beneficiary].checkpoints;
        // Verificar que el número de bloque actual sea mayor al checkpoint y que totalStakingBalance sea mayor a 0.
        require(
            block.number > userCheckpoint,
            "No new blocks since last checkpoint"
        );
        require(totalStakingBalance > 0, "No staking balance");
        // Calcular la cantidad de bloques transcurridos desde el último checkpoint.
        uint256 elapsedBlocks = block.number - userCheckpoint;
        // Calcular la proporción del staking del usuario en relación al total staking (stakingBalance[beneficiary] / totalStakingBalance).
        uint256 stakingRatio = (structUser[beneficiary].stakingBalance * 1e18) /
            totalStakingBalance;
        // Calcular las recompensas del usuario multiplicando la proporción por REWARD_PER_BLOCK y los bloques transcurridos.
        uint256 userReward = (REWARD_PER_BLOCK * elapsedBlocks * stakingRatio) /
            1e18;
        // Actualizar las recompensas pendientes del usuario en pendingRewards.
        structUser[beneficiary].pendingRewards += userReward;
        // Actualizar el checkpoint del usuario al bloque actual.
        structUser[beneficiary].checkpoints = block.number;
    }

    function deductCommission(uint256 _amount) internal returns (uint256) {
        //calcula la comisión
        uint256 feeAmount = (_amount * fee) / 10000;
        //guarda el feeAmount
        accruedFees += feeAmount;
        //retorna el valor neto a transferir
        return _amount - feeAmount;
    }

    function modifyReward(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Reward per block must be greater than 0");
        REWARD_PER_BLOCK = _amount;
        emit NewReward(block.timestamp, "the block reward amount was changed");
    }

    function modifyFee(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Fee must be greater than 0");
        fee = _amount;
        emit FeeChanged(block.timestamp, "the fee amount was changed");
    }

    function withdrawProfits() external {
        uint256 feeAmount = accruedFees;
        require(
            msg.sender == treasury,
            "Only treasury can perform this action"
        );
        require(accruedFees > 0, "No fees to withdraw");
        // Transfiere la comisión a la tesorería
        accruedFees = 0;
        dappToken.mint(treasury, feeAmount);
        emit CommissionWithdrawn(treasury, feeAmount);
    }

    function getAccruedFees() external view returns (uint256) {
        return accruedFees;
    }
}
