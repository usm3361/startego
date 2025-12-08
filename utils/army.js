import createSoldier from "./soldier";

export default function createArmy(player) {
  let army = [];

  let soldier = {
    1: 1,
    2: 8,
    3: 5,
    4: 4,
    5: 4,
    6: 4,
    7: 3,
    8: 2,
    9: 1,
    10: 1,
  };

  for (let i = 1; i <= 10; i++) {
    for (let j = 0; j < soldier[i]; j++) army.push(createSoldier(i, player));
  }

  army.push(createSoldier("flag", player));

  return army;
}
