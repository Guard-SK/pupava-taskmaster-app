<template>
  <div class="min-h-screen bg-gradient-to-br from-neutral-950 via-red-950 to-neutral-950 flex flex-col items-center justify-center p-4 text-white font-sans selection:bg-kahoot-red">
    
    <!-- Connection Status Banner (if server disconnected) -->
    <div v-if="!isConnected" class="fixed top-0 left-0 right-0 bg-red-600/90 text-center py-2 text-sm font-bold animate-pulse z-50 flex items-center justify-center gap-2">
      <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Strata spojenia... Pripájanie
    </div>

    <!-- Settings Gear to change team directly -->
    <button 
      v-if="myTeamId" 
      @click="changeTeamWithPassword" 
      class="fixed top-4 right-4 z-40 w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all focus:outline-none hover:rotate-45"
      title="Zmeniť tím"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300 hover:text-white transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <div v-if="!state" class="flex flex-col items-center gap-4 text-center">
      <div class="w-16 h-16 border-4 border-kahoot-red border-t-transparent rounded-full animate-spin"></div>
      <p class="text-xl font-semibold text-gray-300 animate-pulse">Pripájanie k hre...</p>
    </div>

    <!-- 1. SIGN IN SCREEN: Select team -->
    <div v-else-if="!myTeamId" class="w-full max-w-2xl glass rounded-3xl p-8 shadow-2xl text-center border border-white/10 slide-up-enter-active">
      <div class="mb-8">
        <h1 class="text-4xl font-extrabold font-display bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent">Vybrať tím</h1>
      </div>

      <div class="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1">
        <button 
          v-for="team in state.teams" 
          :key="team.id"
          @click="selectTeam(team.id)"
          class="bg-white/5 hover:bg-red-600/20 hover:border-red-500/50 border border-white/10 text-white font-bold py-5 px-6 rounded-2xl shadow-md transition-all duration-300 transform active:scale-95 text-lg hover:-translate-y-1 hover:shadow-red-600/20"
        >
          {{ team.name }}
        </button>
      </div>
    </div>

    <!-- 2. VOTING IS ACTIVE -->
    <div v-else-if="state.activeVote && state.activeVote.isOpen" class="w-full max-w-4xl flex flex-col items-center">
      <!-- Desktop text (hidden on small mobile screens to save space) -->
      <div class="hidden sm:block text-center mb-8">
        <h2 class="text-white text-3xl md:text-4xl font-extrabold font-display mt-3 drop-shadow-md">
          {{ currentSlideTitle || 'Hlasujte za inštruktora / tím' }}
        </h2>
      </div>
      
      <!-- Countdown Intro Overlay -->
      <div v-if="introCountdown > 0 && !hasVoted" class="flex flex-col items-center justify-center my-12 min-h-[250px] w-full">
        <div :key="introCountdown" class="countdown-number text-[8rem] font-black text-yellow-500 font-display drop-shadow-[0_0_40px_rgba(234,179,8,0.5)]">
          {{ introCountdown }}
        </div>
      </div>

      <!-- Already voted state -->
      <div v-else-if="hasVoted" class="glass rounded-3xl p-10 text-center border border-white/20 w-full max-w-lg shadow-2xl flex flex-col items-center animate-pulse-fast">
        <div class="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-3xl font-extrabold">Hlas zaznamenaný!</h3>
        <p class="text-gray-400 mt-3 text-lg">Vyberali ste možnosť:</p>
        <div class="mt-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xl font-bold text-yellow-400">
          {{ votedOptionName }}
        </div>
        <p class="text-gray-500 mt-6 text-sm">Čaká sa na ostatné tímy.</p>
      </div>

      <!-- Voting Options -->
      <div v-else :class="[
        'grid gap-4 w-full px-2 justify-center',
        state.activeVote.options.length === 2 
          ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' 
          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
      ]">
        <button
          v-for="(opt, index) in state.activeVote.options"
          :key="opt.id"
          @click="submitVote(opt.id)"
          :class="[
            'text-white font-extrabold py-6 px-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 border-b-6 flex flex-col items-center justify-center min-h-[145px] md:min-h-[180px]',
            getButtonClass(index)
          ]"
        >
          <!-- Instructor / Group Avatars -->
          <div class="mb-3">
            <div v-if="isInstructorOption(opt.id)" class="flex justify-center">
              <img v-if="hasImage(getInstructorName(opt.id))" 
                   :src="getInstructorImage(getInstructorName(opt.id))" 
                   class="w-16 h-16 rounded-full object-cover border border-white/20 shadow-md" />
              <div v-else class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold border border-white/20 shadow-inner">
                {{ getInstructorName(opt.id).charAt(0) }}
              </div>
            </div>
            <div v-else class="flex justify-center -space-x-3">
              <div v-for="mId in getGroupMembers(opt.id)" :key="mId">
                <img v-if="hasImage(getInstructorName(mId))" 
                     :src="getInstructorImage(getInstructorName(mId))" 
                     class="w-12 h-12 rounded-full object-cover border border-white/20 shadow-md" />
                <div v-else class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold border border-white/20 shadow-inner">
                  {{ getInstructorName(mId).charAt(0) }}
                </div>
              </div>
            </div>
          </div>

          <span class="text-center drop-shadow-md text-base md:text-lg">
            {{ opt.name || opt.title }}
          </span>
        </button>
      </div>
      </div>

      <!-- 2.5 SPECIAL RESOLVE SCREEN (only steps 1 and 2; step 0 falls to idle) -->
      <div v-else-if="currentSlide?.type === 'special_resolve' && (currentSlide.currentStep === 1 || currentSlide.currentStep === 2)" class="w-full max-w-4xl flex flex-col items-center">
        <!-- Countdown -->
        <div v-if="currentSlide.currentStep === 1" class="flex flex-col items-center justify-center my-12 min-h-[250px] w-full animate-pulse-fast">
          <div :key="introCountdown" class="countdown-number text-[8rem] font-black text-yellow-500 font-display drop-shadow-[0_0_40px_rgba(234,179,8,0.5)]">
            {{ introCountdown > 0 ? introCountdown : '👑' }}
          </div>
        </div>
        
        <!-- Reveal Results -->
        <div v-else-if="currentSlide.currentStep === 2" class="glass rounded-3xl p-10 text-center border border-white/20 w-full max-w-lg shadow-2xl flex flex-col items-center animate-slide-up">
          <h3 class="text-2xl font-bold uppercase text-yellow-500 tracking-wider mb-2">Vyhodnotenie tipovačky</h3>
          
          <!-- Winner Profile -->
          <div class="relative my-6">
            <img v-if="hasImage(getInstructorName(currentSlide.winnerInstructorId))" 
                 :src="getInstructorImage(getInstructorName(currentSlide.winnerInstructorId))" 
                 class="w-24 h-24 rounded-full object-cover border-3 border-yellow-500 shadow-lg" />
            <div v-else class="w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center text-gray-900 font-extrabold text-3xl shadow-inner">
              {{ getInstructorName(currentSlide.winnerInstructorId)?.charAt(0) }}
            </div>
          </div>
          <div class="text-white/60 text-sm mb-1">Víťaz show</div>
          <div class="text-white text-3xl font-black mb-6">{{ getInstructorName(currentSlide.winnerInstructorId) }}</div>

          <!-- Tip status -->
          <div class="mt-4 pt-6 border-t border-white/10 w-full">
            <div class="text-xs uppercase tracking-wider text-gray-400 mb-2">Váš tip:</div>
            <div v-if="myTip" class="inline-block bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-lg font-bold text-gray-300">
              {{ getInstructorName(myTip) }}
            </div>
            <div v-else class="inline-block bg-red-950/20 border border-red-900/30 px-4 py-2 rounded-xl text-lg font-bold text-red-400">
              Netipovali ste
            </div>
            
            <div class="mt-6">
              <span v-if="myTip === currentSlide.winnerInstructorId" class="text-green-400 text-xl font-extrabold block animate-pulse">
                🎉 Správny tip! Získavate +600 bodov
              </span>
              <span v-else class="text-red-400 text-lg font-bold block">
                Nesprávny tip. Body nezískavate.
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. IDLE / WAITING SCREEN -->
    <div v-else class="w-full max-w-lg text-center slide-up-enter-active">
      
      <!-- Final Team Leaderboard Reveal (when animation finishes on projector) -->
      <div v-if="isTeamRevealActive && finalRankRevealed" 
           class="glass rounded-3xl p-10 border-3 border-yellow-500 shadow-[0_0_30px_rgba(250,204,21,0.2)] relative overflow-hidden animate-slide-up">
        <div class="absolute -right-8 -top-8 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl animate-pulse"></div>
        
        <h3 class="text-2xl font-black uppercase text-yellow-500 tracking-wider mb-2">🎉 Celkové Vyhodnotenie 🎉</h3>
        
        <div class="mt-6">
          <div class="text-white/60 text-xs uppercase tracking-widest">Umiestnenie vášho tímu:</div>
          <div class="text-6xl font-black text-white mt-2 mb-1 flex items-center justify-center gap-2">
            <span v-if="myTeamRankInfo?.rank === 1">🏆 1.</span>
            <span v-else-if="myTeamRankInfo?.rank === 2">🥈 2.</span>
            <span v-else-if="myTeamRankInfo?.rank === 3">🥉 3.</span>
            <span v-else>{{ myTeamRankInfo?.rank }}.</span>
            <span class="text-3xl">miesto</span>
          </div>
          <p class="text-yellow-400 text-lg font-bold mt-2">s počtom {{ myTeamRankInfo?.score }} bodov</p>
        </div>
      </div>

      <!-- Standard Wait Screen or during reveal animation -->
      <div v-else class="glass rounded-3xl p-12 shadow-2xl border border-white/10 relative overflow-hidden">
        <!-- Floating decor to resemble Taskmaster wax seal -->
        <div class="absolute -right-8 -top-8 w-24 h-24 bg-red-600/10 rounded-full blur-2xl"></div>
        <div class="absolute -left-8 -bottom-8 w-24 h-24 bg-red-600/10 rounded-full blur-2xl"></div>
        
        <p class="text-xl text-gray-200 font-semibold mb-2">Sledujte plátno prezentácie.</p>
        
        <p v-if="isTeamRevealActive && !finalRankRevealed" class="text-sm text-yellow-500 font-extrabold animate-pulse uppercase tracking-wider my-3">
          ⏳ Prebieha odhaľovanie výsledkov...
        </p>

        <!-- Current Score / Status if available and not during the reveal timer -->
        <template v-if="!(isTeamRevealActive && !finalRankRevealed)">
          <div class="mt-8 pt-6 border-t border-white/10 space-y-3">
            <div v-if="myTeamRankInfo" class="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <span class="text-gray-400 text-sm font-semibold">Aktuálne umiestnenie:</span>
              <span class="text-xl font-black text-white">
                {{ myTeamRankInfo.allZero ? '—' : `${myTeamRankInfo.rank}. miesto` }}
              </span>
            </div>

            <div v-if="myTeamScore !== null" class="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <span class="text-gray-400 text-sm font-semibold">Aktuálne body:</span>
              <span class="text-xl font-black text-yellow-400">{{ myTeamScore }} b</span>
            </div>
          </div>

          <!-- Gap / Tied with text -->
          <div v-if="myTeamRankInfo?.statusText" class="mt-4 text-xs font-bold text-gray-300 bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-center">
            {{ myTeamRankInfo.statusText }}
          </div>
        </template>
      </div>
      
      <div class="mt-8 text-white/65 font-semibold text-sm flex items-center justify-center gap-4 select-none">
        <span>{{ myTeamName }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { socket } from '../socket';

const state = ref(null);
const isConnected = ref(socket.connected);
const myTeamId = ref(localStorage.getItem('taskmaster_team_id') || null);
const introCountdown = ref(0);
let countdownInterval = null;

const currentSlide = computed(() => {
  if (!state.value) return null;
  return state.value.slides[state.value.currentSlideIndex];
});

const myTip = computed(() => {
  if (!state.value || !myTeamId.value) return null;
  const initialSlide = state.value.slides.find(s => s.type === 'special');
  if (!initialSlide || !initialSlide.votes) return null;
  return initialSlide.votes[myTeamId.value];
});

watch([() => state.value?.activeVote?.isOpen, () => currentSlide.value?.currentStep], ([isOpen, step]) => {
  const isSpecialResolveReveal = currentSlide.value?.type === 'special_resolve' && step === 1;
  const isVoteRunning = isOpen;
  
  if (isVoteRunning || isSpecialResolveReveal) {
    if (countdownInterval) clearInterval(countdownInterval);
    introCountdown.value = 3;
    countdownInterval = setInterval(() => {
      if (introCountdown.value > 0) {
        introCountdown.value--;
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000);
  } else {
    introCountdown.value = 0;
    if (countdownInterval) clearInterval(countdownInterval);
  }
}, { immediate: true });

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});

onMounted(() => {
  document.title = 'Client';
  // Setup listeners
  socket.on('connect', () => {
    isConnected.value = true;
    registerRole();
  });

  socket.on('disconnect', () => {
    isConnected.value = false;
  });

  socket.on('stateUpdate', (newState) => {
    state.value = newState;
  });

  // If already connected when component mounts
  if (socket.connected) {
    registerRole();
  }
});

// Watch teamId to register/change role dynamically
watch(myTeamId, () => {
  registerRole();
});

const registerRole = () => {
  if (socket.connected) {
    socket.emit('client:register', { 
      role: 'client', 
      teamId: myTeamId.value 
    });
  }
};

const selectTeam = (id) => {
  myTeamId.value = id;
  localStorage.setItem('taskmaster_team_id', id);
};

const resetTeam = () => {
  myTeamId.value = null;
  localStorage.removeItem('taskmaster_team_id');
};

const changeTeamWithPassword = () => {
  const password = prompt('Zadaj heslo:');
  if (password === '787282') {
    resetTeam();
  } else if (password !== null) {
    alert('Nesprávne heslo!');
  }
};

const hasVoted = computed(() => {
  if (!state.value || !state.value.activeVote) return false;
  return !!state.value.activeVote.votes[myTeamId.value];
});

const votedOptionName = computed(() => {
  if (!state.value || !state.value.activeVote || !myTeamId.value) return '';
  const voteOptionId = state.value.activeVote.votes[myTeamId.value];
  const option = state.value.activeVote.options.find(o => o.id === voteOptionId);
  return option ? (option.name || option.title) : '';
});

const currentSlideTitle = computed(() => {
  if (!state.value || !state.value.activeVote) return '';
  const slide = state.value.slides.find(s => s.id === state.value.activeVote.slideId);
  return slide ? slide.title : '';
});

const myTeamName = computed(() => {
  if (!state.value || !myTeamId.value) return '';
  const t = state.value.teams.find(t => t.id === myTeamId.value);
  return t ? t.name : '';
});

const myTeamScore = computed(() => {
  if (!state.value || !myTeamId.value) return null;
  const t = state.value.teams.find(t => t.id === myTeamId.value);
  return t ? t.score : null;
});

const submitVote = (optionId) => {
  if (myTeamId.value) {
    socket.emit('client:vote', { teamId: myTeamId.value, optionId });
  }
};

// Button color classes for Kahoot styling
const getButtonClass = (index) => {
  const classes = [
    'bg-kahoot-red hover:bg-red-700 border-red-700 shadow-red-950/30',
    'bg-kahoot-blue hover:bg-blue-700 border-blue-700 shadow-blue-950/30',
    'bg-kahoot-green hover:bg-green-700 border-green-800 shadow-green-950/30',
    'bg-kahoot-yellow hover:bg-yellow-600 text-neutral-900 border-yellow-600 shadow-yellow-950/30',
    'bg-purple-600 hover:bg-purple-700 border-purple-800 shadow-purple-950/30',
    'bg-teal-600 hover:bg-teal-700 border-teal-800 shadow-teal-950/30'
  ];
  return classes[index % classes.length];
};

const isInstructorOption = (optId) => {
  return optId.startsWith('ins');
};

const getInstructorName = (insId) => {
  if (!state.value) return '';
  const ins = state.value.instructors.find(i => i.id === insId);
  return ins ? ins.name : '';
};

const getGroupMembers = (groupId) => {
  if (!state.value || !state.value.activeVote) return [];
  const slide = state.value.slides.find(s => s.id === state.value.activeVote.slideId);
  if (!slide || !slide.teamGroups) return [];
  const grp = slide.teamGroups.find(g => g.id === groupId);
  return grp ? grp.members : [];
};

const hasImage = (name) => {
  if (!name) return false;
  const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return ['david', 'jul', 'juro', 'danko', 'matus', 'ella', 'zuzka'].includes(norm);
};

const getInstructorImage = (name) => {
  const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (norm === 'david') return '/David.avif';
  if (norm === 'jul') return '/Jul.avif';
  if (norm === 'juro') return '/Juro.avif';
  if (norm === 'matus') return '/Matus.avif';
  if (norm === 'ella') return '/Ella.avif';
  if (norm === 'zuzka') return '/Zuzka.avif';
  return null;
};

const sortedTeams = computed(() => {
  if (!state.value || !state.value.teams) return [];
  return [...state.value.teams].sort((a, b) => b.score - a.score);
});

const rankedTeams = computed(() => {
  if (!sortedTeams.value) return [];
  let currentRank = 1;
  return sortedTeams.value.map((team, index) => {
    if (index > 0 && team.score < sortedTeams.value[index - 1].score) {
      currentRank = index + 1;
    }
    return {
      ...team,
      rank: currentRank
    };
  });
});

const myTeamRankInfo = computed(() => {
  if (!state.value || !myTeamId.value || sortedTeams.value.length === 0) return null;
  
  // If everyone has 0 points, don't show the ranking/tied status
  const allZero = sortedTeams.value.every(t => t.score === 0);
  
  let currentRank = 1;
  const ranked = sortedTeams.value.map((t, idx) => {
    if (idx > 0 && t.score < sortedTeams.value[idx - 1].score) {
      currentRank = idx + 1;
    }
    return {
      id: t.id,
      name: t.name,
      score: t.score,
      rank: currentRank
    };
  });

  const myRankIndex = ranked.findIndex(t => t.id === myTeamId.value);
  if (myRankIndex === -1) return null;

  const myTeam = ranked[myRankIndex];

  let statusText = '';
  if (!allZero) {
    if (myTeam.rank === 1) {
      const ties = ranked.filter(t => t.rank === 1 && t.id !== myTeam.id);
      if (ties.length > 0) {
        statusText = `O 1. miesto sa delíte s: ${ties.map(t => t.name).join(', ')}`;
      } else {
        statusText = 'Ste na 1. mieste!';
      }
    } else {
      const ties = ranked.filter(t => t.rank === myTeam.rank && t.id !== myTeam.id);
      if (ties.length > 0) {
        statusText = `Ste na delenom ${myTeam.rank}. mieste spolu s: ${ties.map(t => t.name).join(', ')}`;
      } else {
        const aheadTeam = ranked[myRankIndex - 1];
        if (aheadTeam) {
          const gap = aheadTeam.score - myTeam.score;
          statusText = `Na tím ${aheadTeam.name} strácate ${gap} b.`;
        }
      }
    }
  }

  return {
    rank: myTeam.rank,
    score: myTeam.score,
    statusText,
    allZero
  };
});

const isTeamRevealActive = computed(() => {
  if (!currentSlide.value) return false;
  return currentSlide.value.type === 'leaderboard_teams';
});

const getRevealDelays = (rankedList) => {
  if (!rankedList || rankedList.length === 0) return [];
  const uniqueRanks = [...new Set(rankedList.map(item => item.rank))].sort((a, b) => b - a);
  const delays = [];
  let currentDelay = 1000;
  uniqueRanks.forEach((rank, idx) => {
    if (idx > 0) {
      const isLast = idx === uniqueRanks.length - 1;
      currentDelay += isLast ? 3000 : 2000;
    }
    delays.push({ rank, delay: currentDelay });
  });
  return delays;
};

const finalRankRevealed = ref(false);
let revealTimer = null;

watch(isTeamRevealActive, (active) => {
  if (revealTimer) clearTimeout(revealTimer);
  if (active) {
    finalRankRevealed.value = false;
    const delaysInfo = getRevealDelays(rankedTeams.value);
    const myTeamRank = myTeamRankInfo.value?.rank;
    
    let revealDelay = 6000;
    if (myTeamRank !== undefined && myTeamRank !== null) {
      const myRankDelayInfo = delaysInfo.find(d => d.rank === myTeamRank);
      if (myRankDelayInfo) {
        revealDelay = myRankDelayInfo.delay;
      }
    } else if (delaysInfo.length > 0) {
      revealDelay = delaysInfo[delaysInfo.length - 1].delay;
    }
    
    revealTimer = setTimeout(() => {
      finalRankRevealed.value = true;
    }, revealDelay + 1500); // 1.5 seconds safety buffer after it shows on projector
  } else {
    finalRankRevealed.value = false;
  }
}, { immediate: true });
</script>

<style scoped>
.countdown-number {
  animation: pulseScale 1s infinite ease-out;
}

@keyframes pulseScale {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  10% {
    transform: scale(1.1);
    opacity: 1;
  }
  80% {
    transform: scale(1.0);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* Fade animation for settings dropdown */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
