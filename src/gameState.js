import { modFox, modScene, togglePoopBag, writeModal } from "./ui";
import { RAIN_CHANCE, SCENES, DAY_LENGTH, NIGHT_LENGTH, getNextHungryTime, getNextDieTime, getNextPoopTime } from "./constants";

const gameState = {
  current: 'INIT',
  clock: 1,
  wakeTime: -1,
  sleepTime: -1,
  hungrytime: -1,
  dieTime: -1,
  timeToStartCelebrating: -1,
  timeToEndCelebrating: -1,
  scene: 0,
  tick(){
    this.clock++;
    console.log('clock', this.clock);

    if (this.clock === this.wakeTime) {
      this.wake();
    }
    else if(this.clock === this.sleepTime){
      this.sleep();
    }
    else if(this.clock === this.hungrytime){
      this.getHungry();
    }
    else if(this.clock === this.dieTime){
      this.die();
    }
    else if(this.clock === this.timeToStartCelebrating){
      this.startCelebrating();
    }
    else if(this.clock === this.timeToEndCelebrating){
      this.endCelebrating();
    }
    else if(this.clock === this.poopTime){
      this.poop();
    }

    return this.clock;
  },
  startGame(){
    this.current = 'HATCHING';
    this.wakeTime = this.clock + 3;
    writeModal('')

    modFox('egg');
    modScene('day');
  },
  wake(){
    this.current = 'IDLING';
    this.wakeTime = -1;

    this.scene = Math.random() > RAIN_CHANCE ? 0 : 1;
    modScene(SCENES[this.scene]);

    //time to when fox will sleep
    this.sleepTime = this.clock + DAY_LENGTH;
    console.log(this.sleepTime);

    //time to when fox will be hungry
    this.hungrytime = getNextHungryTime(this.clock)

    //if not rain, face camera, else, face backward
    this.determineFoxState();
  },
  sleep(){
    this.state = 'SLEEP';
    modFox('sleep');
    modScene('night');

    //make sure that when sleeping, no other activities like pooping, hungry etc
    this.clearTimes();

    //time to when fox will wake up
    this.wakeTime = this.clock + NIGHT_LENGTH;
  },
  clearTimes(){
    this.wakeTime = -1;
    this.sleepTime = -1;
    this.hungrytime = -1;
    this.dieTime = -1;
    this.poopTime = -1;
    this.timeToStartCelebrating = -1;
    this.timeToEndCelebrating = -1;
  },
  getHungry(){
    this.current = 'HUNGRY';
    this.dieTime = getNextDieTime(this.clock);
    this.hungrytime = -1;
    modFox('hungry');
  },
  poop(){
    this.current = 'POOPING';
    this.poopTime = -1;
    this.dieTime = getNextDieTime(this.clock);
    modFox('pooping');
  },
  die(){
    this.current = 'DEAD';
    modFox('dead');
    this.clearTimes();
    writeModal('Press middle button to start');
  },
  startCelebrating(){
    this.current = 'CELEBRATING';
    modFox('celebrate');
    this.timeToStartCelebrating = -1;
    this.timeToEndCelebrating = this.clock + 2;
  },
  endCelebrating(){
    this.timeToEndCelebrating = -1;
    this.current = 'IDLING';
    this.determineFoxState();
    togglePoopBag(false);
  },
  determineFoxState(){
    if(this.current === 'IDLING'){
      if(SCENES[this.scene] === 'rain'){
        modFox('rain');
      }
      else{
        modFox('idling');
      }
    }
  },
  handleUserAction(icon){
    console.log(icon);
    if(['SLEEP', 'FEEDING', 'CELEBRATING', 'HATCHING'].includes(this.current)){
      return;
    }

    if(this.current === 'INIT' || this.current === 'DEAD'){
      this.startGame();
      return;
    }

    switch (icon) {
      case 'weather':
        this.changeWeather()
        break;
      case 'poop':
        this.cleanUpPoop();
        break;
      case 'fish':
        this.feed();
        break;
    }
  },
  changeWeather(){
    this.scene = (this.scene + 1) % SCENES.length;
    modScene(SCENES[this.scene]);
    this.determineFoxState()

  },
  cleanUpPoop(){
    if(this.current !== 'POOPING'){
      return;
    }

    this.dieTime = -1;
    togglePoopBag(true);
    this.startCelebrating();
    this.hungrytime = getNextHungryTime(this.clock);
  },
  feed(){
    if(this.current !== 'HUNGRY'){
      return;
    }

    this.current = 'FEEDING';
    this.dieTime = -1;
    this.poopTime = getNextPoopTime(this.clock);
    modFox('eating');
    this.timeToStartCelebrating = this.clock + 2;
  }
};

/*
  bind the gameState to handleUserAction so that even though the methods in gameState is called in buttons.js (handleUserActions),
  `this` (as in this.startGame) will refer to the gameState, and not window or undefined
*/
export const handleUserAction =  gameState.handleUserAction.bind(gameState);  
export default gameState;