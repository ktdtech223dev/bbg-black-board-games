function rollDie() {
  return Math.ceil(Math.random() * 6);
}

function resolveCombat(attacker, defender, tile, modifiers = {}) {
  const atkRoll = rollDie() + rollDie() + Math.floor((attacker.resources.muscle || 0) / 500);

  let defRolls = defender.defenseRolls || 1;
  if (defender.faction === 'oblock' && defender.abilityActive) defRolls = 2;

  let defRoll = 0;
  for (let i = 0; i < defRolls; i++) {
    const r = rollDie() + rollDie() + Math.floor((tile.tier || 0) * 1.5);
    defRoll = Math.max(defRoll, r);
  }

  const attackerWon = atkRoll > defRoll;
  return { attackerWon, atkRoll, defRoll };
}

module.exports = { resolveCombat, rollDie };
