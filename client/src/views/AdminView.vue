<template>
  <div class="h-screen w-screen bg-neutral-950 text-gray-100 flex overflow-hidden font-sans">
    <!-- Password Authentication Gate -->
    <div v-if="!isAuthenticated" class="min-h-screen w-full bg-gradient-to-br from-neutral-950 via-red-950 to-neutral-950 flex flex-col items-center justify-center p-6 text-white font-sans flex-shrink-0">
      <div class="w-full max-w-md glass rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col items-center relative overflow-hidden select-none">
        <div class="mb-6 shrink-0 text-center">
          <h1 class="text-2xl font-black font-display tracking-wide">Administrácia</h1>
          <p class="text-xs text-gray-400 mt-1">Prístup je chránený heslom</p>
        </div>

        <button 
          @click="loginAdmin" 
          class="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow-lg text-sm"
        >
          Odomknúť konzolu
        </button>

        <div v-if="authError" class="text-xs text-red-500 font-bold text-center mt-4">
          ⚠️ {{ authError }}
        </div>
      </div>
    </div>

    <!-- Authenticated Admin Workspace -->
    <template v-else>
    
    <!-- 1. LEFT BAR: Slide Builder & Global settings -->
    <div :class="['bg-neutral-900 border-r border-white/5 flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden']"
         :style="{
           width: isLeftSidebarOpen ? '22rem' : '0px',
           minWidth: isLeftSidebarOpen ? '22rem' : '0px',
           opacity: isLeftSidebarOpen ? '1' : '0'
         }">
      
      <!-- Tabs header -->
      <div class="flex border-b border-white/5 bg-neutral-950">
        <button 
          @click="activeLeftTab = 'slides'" 
          :class="['flex-1 py-3 text-sm font-bold border-b-2 transition-all', activeLeftTab === 'slides' ? 'border-kahoot-red text-white bg-white/5' : 'border-transparent text-gray-400 hover:text-white']"
        >
          Slajdy
        </button>
        <button 
          @click="activeLeftTab = 'teams'" 
          :class="['flex-1 py-3 text-sm font-bold border-b-2 transition-all', activeLeftTab === 'teams' ? 'border-kahoot-red text-white bg-white/5' : 'border-transparent text-gray-400 hover:text-white']"
        >
          Nastavenia tímov
        </button>
      </div>

      <!-- Tab Content: Slide list -->
      <div v-if="activeLeftTab === 'slides'" class="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs uppercase tracking-wider text-gray-400 font-bold">Zoznam Slajdov</span>
          
          <!-- Add Slide dropdown -->
          <div class="relative">
            <button @click="showAddMenu = !showAddMenu" class="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
              + Pridať slajd
            </button>
            <div v-if="showAddMenu" class="absolute right-0 mt-2 w-56 bg-neutral-800 rounded-xl shadow-2xl border border-white/10 py-1 z-50">
              <button @click="addNewSlide('blank')" class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm font-semibold flex items-center">
                <span class="w-2 h-2 rounded-full mr-2.5 bg-gray-500 shrink-0"></span>
                Blank
              </button>
              <button @click="addNewSlide('vote_individual')" class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm font-semibold flex items-center">
                <span class="w-2 h-2 rounded-full mr-2.5 bg-red-500 shrink-0"></span>
                Individuálne hlasovanie
              </button>
              <button @click="addNewSlide('vote_team')" class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm font-semibold flex items-center">
                <span class="w-2 h-2 rounded-full mr-2.5 bg-blue-500 shrink-0"></span>
                Tímové hlasovanie
              </button>
              <button @click="addNewSlide('leaderboard_instructors')" class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm font-semibold flex items-center">
                <span class="w-2 h-2 rounded-full mr-2.5 bg-purple-500 shrink-0"></span>
                Vyhodnotenie inštruktorov
              </button>
              <button @click="addNewSlide('leaderboard_teams')" class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm font-semibold flex items-center">
                <span class="w-2 h-2 rounded-full mr-2.5 bg-emerald-500 shrink-0"></span>
                Vyhodnotenie tímov
              </button>
              <button @click="addNewSlide('special')" class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm font-semibold flex items-center">
                <span class="w-2 h-2 rounded-full mr-2.5 bg-amber-500 shrink-0"></span>
                Tipovačka
              </button>
              <button @click="addNewSlide('special_resolve')" class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm font-semibold flex items-center">
                <span class="w-2 h-2 rounded-full mr-2.5 bg-amber-500 shrink-0"></span>
                Vyhodnotenie tipovačky
              </button>
              <button @click="addNewSlide('leaderboard')" class="w-full text-left px-4 py-2 hover:bg-white/5 text-sm font-semibold flex items-center">
                <span class="w-2 h-2 rounded-full mr-2.5 bg-pink-500 shrink-0"></span>
                Kombinovaný Leaderboard
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-2 flex-1 overflow-y-auto pr-1">
          <div v-for="(slide, idx) in (state?.slides || [])" :key="slide.id"
               @click="goToSlide(idx)"
               class="p-3 rounded-xl cursor-pointer border transition-all duration-200"
               :class="idx === state?.currentSlideIndex ? 'border-kahoot-red bg-red-950/20 shadow-lg' : 'border-white/5 bg-white/5 hover:bg-white/10'">
            
            <div class="flex justify-between items-center mb-2">
              <span class="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                    :class="getSlideBadgeClass(slide.type)">
                {{ slide.type }}
              </span>
              <div class="flex items-center gap-1.5" @click.stop>
                <button @click="moveSlide(idx, -1)" :disabled="idx === 0" class="text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 p-0.5">▲</button>
                <button @click="moveSlide(idx, 1)" :disabled="idx === state.slides.length - 1" class="text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 p-0.5">▼</button>
                <button @click="deleteSlide(idx)" class="text-red-500 hover:text-red-400 ml-1 px-1 font-bold">×</button>
              </div>
            </div>

            <!-- Slide Title Editing -->
            <div v-if="slide.type !== 'blank' && slide.type !== 'leaderboard' && slide.type !== 'leaderboard_instructors' && slide.type !== 'leaderboard_teams' && slide.type !== 'special' && slide.type !== 'special_resolve'" @click.stop>
              <input v-model="slide.title" 
                     @change="updateState"
                     placeholder="Názov úlohy..."
                     class="w-full bg-neutral-900 border border-white/10 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-red-500" />
            </div>
            <div v-else class="text-xs font-semibold text-gray-300 italic">
              {{ 
                slide.type === 'blank' ? 'Blank Slide' : 
                slide.type === 'leaderboard' ? 'Kombinovaný Leaderboard' : 
                slide.type === 'leaderboard_instructors' ? 'Vyhodnotenie inštruktorov' : 
                slide.type === 'leaderboard_teams' ? 'Vyhodnotenie tímov' : 
                slide.type === 'special' ? 'Tipovačka' : 
                slide.type === 'special_resolve' ? 'Vyhodnotenie tipovačky' : 
                'Slajd'
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Kids Team names editor -->
      <div v-else-if="activeLeftTab === 'teams'" class="flex-1 overflow-y-auto p-4 space-y-4">
        <h3 class="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Mená Tímov</h3>
        <div class="space-y-2">
          <div v-for="team in state?.teams" :key="team.id" class="flex items-center gap-2">
            <span class="text-xs text-gray-500 font-bold w-12">{{ team.id.replace('team', 'Tím ') }}</span>
            <input v-model="team.name" 
                   @change="updateState"
                   class="flex-1 bg-neutral-900 border border-white/10 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-red-500" />
          </div>
        </div>
      </div>

    </div>

    <!-- 2. MAIN WORKSPACE AREA -->
    <div class="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden">
      
      <!-- Top header bar -->
      <div class="h-16 bg-neutral-900 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-3">
          <!-- Toggle Left Sidebar -->
          <button @click="isLeftSidebarOpen = !isLeftSidebarOpen" class="text-gray-400 hover:text-white p-1.5 hover:bg-neutral-800 rounded-xl transition-all cursor-pointer mr-1 animate-pulse" title="Schovať / Zobraziť ľavý panel">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button @click="prevSlide" :disabled="!state || state.currentSlideIndex === 0" 
                  class="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-sm px-4 py-2 rounded-xl font-semibold transition-all">
            &larr; Predošlý
          </button>
          <span class="font-mono text-sm bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            Slajd {{ (state?.currentSlideIndex || 0) + 1 }} / {{ state?.slides.length }}
          </span>
          <button @click="nextSlide" :disabled="!state || state.currentSlideIndex === state.slides.length - 1"
                  class="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-sm px-4 py-2 rounded-xl font-semibold transition-all">
            Ďalší &rarr;
          </button>
        </div>

        <div class="flex items-center gap-3">
          <!-- Freeze/Unfreeze presentation screen and controllers -->
          <button 
            @click="toggleFreeze" 
            :class="[
              'text-xs px-4 py-2 rounded-xl transition-all font-bold cursor-pointer flex items-center gap-1.5 border',
              state?.isFrozen
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] animate-pulse'
                : 'bg-neutral-800 hover:bg-neutral-700 text-gray-300 border-white/5'
            ]"
            :title="state?.isFrozen ? 'Rozmraziť projektor a klienta' : 'Zamraziť projektor a klienta'"
          >
            <svg v-if="state?.isFrozen" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18M3 12h18m-3-6L6 18M6 6l12 12" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {{ state?.isFrozen ? 'ZAMRAZENÉ' : 'Zamraziť obraz' }}
          </button>

          <button @click="confirmResetAll" class="text-xs text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/40 px-3 py-1.5 rounded-xl transition-all">
            Vynulovať body a hru
          </button>
          <!-- Toggle Right Sidebar -->
          <button @click="isRightSidebarOpen = !isRightSidebarOpen" class="text-gray-400 hover:text-white p-1.5 hover:bg-neutral-800 rounded-xl transition-all cursor-pointer" title="Schovať / Zobraziť pravý panel">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Main Controls and Panels -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        
        <!-- Live Slide Preview / Action Panel -->
        <div class="bg-neutral-900 rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden">
          
          <div class="flex justify-between items-start mb-6">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase text-red-500 tracking-widest">Aktuálny Slajd</span>
                <span v-if="state?.isFrozen" class="inline-flex items-center gap-1 text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Zmrazený obraz na projektore a klientoch
                </span>
              </div>
              <h2 class="text-3xl font-black font-display text-white mt-1">
                {{ currentSlide?.title || (currentSlide?.type === 'blank' ? 'Blank Slide' : 'Leaderboard') }}
              </h2>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400 font-semibold">Projektor: {{ state?.connectedClients?.projector ? 'Pripojený' : 'Odpojený' }}</span>
            </div>
          </div>

          <!-- A. SLIDE TYPE: BLANK OR LEADERBOARD -->
          <div v-if="currentSlide?.type === 'blank' || 
                     currentSlide?.type === 'leaderboard' || 
                     currentSlide?.type === 'leaderboard_instructors' || 
                     currentSlide?.type === 'leaderboard_teams'" 
               class="bg-neutral-950/40 rounded-2xl p-8 text-center text-gray-400 italic border border-white/5">
            <div v-if="currentSlide.type === 'blank'">
              Tento slajd je blank (prázdny).
            </div>
            <div v-else-if="currentSlide.type === 'leaderboard_instructors'">
              Tento slajd zobrazuje priebežný leaderboard inštruktorov.
            </div>
            <div v-else-if="currentSlide.type === 'leaderboard_teams'">
              Tento slajd zobrazuje priebežný leaderboard tímov.
            </div>
            <div v-else>
              Tento slajd zobrazuje kombinovaný leaderboard (body inštruktorov a tímov).
            </div>
          </div>

          <!-- B. SLIDE TYPE: VOTING SLIDES (individual, team) -->
          <div v-else class="space-y-6">
            
            <!-- Step Progress Indicator -->
            <div v-if="currentSlide?.type === 'vote_individual' || currentSlide?.type === 'vote_team'" 
                 class="flex items-center justify-between max-w-3xl mx-auto bg-neutral-950/60 p-2 rounded-2xl border border-white/5 shadow-inner">
              <button v-for="(label, stepIdx) in ['Úvodné video', 'Hlasovanie', 'Výsledky hlasov', 'Vyhodnocovacie video', 'Priebežný leaderboard']" 
                      :key="stepIdx"
                      @click="setStep(stepIdx)"
                      :class="[
                        'text-[10px] sm:text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex-1',
                        currentSlide.currentStep === stepIdx 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-950/20' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      ]">
                {{ stepIdx + 1 }}. {{ label }}
              </button>
            </div>

            <!-- Step Progress Indicator for Special Vote (2 steps) -->
            <div v-else-if="currentSlide?.type === 'special'" 
                 class="flex items-center justify-between max-w-xl mx-auto bg-neutral-950/60 p-2 rounded-2xl border border-white/5 shadow-inner">
              <button v-for="(label, stepIdx) in ['Hlasovanie', 'Výsledky hlasov']" 
                      :key="stepIdx"
                      @click="setStep(stepIdx + 1)"
                      :class="[
                        'text-[10px] sm:text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex-1',
                        currentSlide.currentStep === (stepIdx + 1) 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-950/20' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      ]">
                {{ stepIdx + 1 }}. {{ label }}
              </button>
            </div>

            <!-- Step Progress Indicator for Special Resolve (2 tabs: selection + reveal) -->
            <div v-else-if="currentSlide?.type === 'special_resolve'" 
                 class="flex items-center justify-between max-w-xl mx-auto bg-neutral-950/60 p-2 rounded-2xl border border-white/5 shadow-inner">
              <button v-for="(label, stepIdx) in ['Výber víťaza', 'Odhalenie víťaza']" 
                      :key="stepIdx"
                      @click="setStep(stepIdx === 0 ? 0 : 2)"
                      :class="[
                        'text-[10px] sm:text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex-1',
                        (stepIdx === 0 ? currentSlide.currentStep === 0 : currentSlide.currentStep >= 1)
                          ? 'bg-red-600 text-white shadow-lg shadow-red-950/20' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      ]">
                {{ stepIdx + 1 }}. {{ label }}
              </button>
            </div>

            <div class="bg-neutral-950/40 rounded-2xl p-6 border border-white/5">
              
              <!-- TASK TYPE: INDIVIDUAL OR TEAM -->
              <div v-if="currentSlide?.type === 'vote_individual' || currentSlide?.type === 'vote_team'">
                
                <!-- STEP 0: INTRO VIDEO & CONFIGS -->
                <div v-if="currentSlide.currentStep === 0" class="text-center py-6">
                  <div class="w-16 h-16 mx-auto mb-4 bg-red-600/10 rounded-full flex items-center justify-center text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-gray-200 mb-2">Krok 1: Úvodné video</h3>
                  <p class="text-xs text-gray-400 max-w-md mx-auto mb-8">Projektor ukazuje prázdnu obrazovku. Môžeš spustiť video.</p>

                  <!-- Team Editor visible only in Step 0 for Team Tasks -->
                  <div v-if="currentSlide.type === 'vote_team'" class="text-left mb-8 max-w-4xl mx-auto p-4 bg-white/5 rounded-2xl border border-white/5">
                    <h4 class="text-xs font-bold text-yellow-500 mb-3 uppercase tracking-wider">Tímová konfigurácia inštruktorov</h4>
                    <div class="flex gap-6 mb-4">
                      <label class="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer">
                        <input type="radio" value="3x2" v-model="teamVoteFormat" @change="handleTeamFormatChange('3x2')" class="accent-red-500" />
                        3 Tímy po 2 inštruktoroch (body: 600, 400, 200)
                      </label>
                      <label class="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer">
                        <input type="radio" value="2x3" v-model="teamVoteFormat" @change="handleTeamFormatChange('2x3')" class="accent-red-500" />
                        2 Tímy po 3 inštruktoroch (body: 600, 300)
                      </label>
                    </div>

                    <!-- Group Names Inputs -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div v-for="(group, gIdx) in localGroups" :key="group.id" class="flex flex-col gap-1">
                        <label class="text-[10px] text-gray-400 font-bold uppercase">Názov tímu {{ gIdx + 1 }}</label>
                        <input v-model="group.name" @change="saveTeamGroupConfig" placeholder="Názov skupiny..." class="bg-neutral-950 border border-white/10 text-xs px-3 py-2 rounded-xl focus:outline-none" />
                      </div>
                    </div>

                    <!-- Instructor Dropdowns mapping -->
                    <h5 class="text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">Rozdelenie inštruktorov:</h5>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      <div v-for="ins in state?.instructors" :key="ins.id" class="bg-black/40 p-2 rounded-xl border border-white/5 flex flex-col justify-between">
                        <span class="text-[11px] font-bold text-gray-200 block truncate mb-2">{{ ins.name }}</span>
                        <select :value="getInstructorGroupId(ins.id)" @change="setInstructorGroup(ins.id, $event.target.value)" 
                                class="w-full bg-neutral-900 text-[10px] border border-white/10 rounded px-1.5 py-1 focus:outline-none focus:border-red-500">
                          <option v-for="grp in localGroups" :key="grp.id" :value="grp.id">
                            {{ grp.name || grp.id }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button @click="startVote" class="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                    Spustiť hlasovanie! (Krok 2)
                  </button>
                </div>

                <!-- STEP 1: VOTING IN PROGRESS -->
                <div v-if="currentSlide.currentStep === 1" class="text-center py-4">
                  <div class="inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-full border border-red-500/20 font-bold mb-4 animate-pulse">
                    Prebieha hlasovanie detí...
                  </div>
                  <p class="text-xs text-gray-400 mb-6">Deti teraz vidia možnosti a hlasujú na svojich zariadeniach.</p>
                  
                  <!-- Voting Grid -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 my-6 max-w-4xl mx-auto">
                    <div v-for="team in state?.teams" :key="team.id" 
                         class="p-3 rounded-xl border flex flex-col items-center justify-center transition-all"
                         :class="[
                           hasVoted(team.id) ? 'border-green-500/40 bg-green-950/20 text-white' : 'border-white/5 bg-white/5 text-gray-500',
                           isTeamOnline(team.id) ? '' : 'opacity-40'
                         ]">
                      <div class="flex items-center gap-1 mb-1">
                        <span class="h-2 w-2 rounded-full" :class="isTeamOnline(team.id) ? 'bg-green-500' : 'bg-red-500'"></span>
                        <span class="text-[10px] font-bold truncate max-w-16">{{ team.name }}</span>
                      </div>
                      <span class="text-xl font-bold">{{ hasVoted(team.id) ? '✓' : '...' }}</span>
                    </div>
                  </div>

                  <div class="flex gap-4 justify-center mt-6">
                    <button @click="closeVote" class="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg shadow-red-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                      Ukončiť hlasovanie (Krok 3)
                    </button>
                    <button @click="resetVote" class="text-xs text-gray-400 hover:underline">
                      Reštartovať a hlasovať znova
                    </button>
                  </div>
                </div>

                <!-- STEP 2: RESULTS (GUESSES) -->
                <div v-if="currentSlide.currentStep === 2" class="text-center py-4">
                  <div class="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full border border-yellow-500/20 font-bold mb-4">
                    Výsledky hlasovania tímov
                  </div>
                  <p class="text-xs text-gray-400 mb-6">Projektor zobrazuje bar-chart graf.</p>
                  
                  <button @click="setStep(3)" class="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                    Pustiť vyhodnocovacie video (Krok 4)
                  </button>
                </div>

                <!-- STEP 3: PROOF VIDEO & REALTIME RANKINGS -->
                <div v-if="currentSlide.currentStep === 3" class="py-4">
                  <div class="text-center max-w-md mx-auto mb-6">
                    <div class="w-16 h-16 mx-auto mb-4 bg-red-600/10 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                    <h3 class="text-lg font-bold text-gray-200 mb-1">Krok 4: Vyhodnocovacie video a poradie</h3>
                    <p class="text-xs text-gray-400">Teraz daj video kde robíme ten task na projektor, prezentácia má blank. Počas videa môžeš zoraďovať inštruktorov podľa toho ako to Danko vyhodnotí. Kliknutím na button nižšie pripíšeš body podľa tvojho zoradenia a ukážeš na prezentácií leaderboard</p>
                  </div>

                  <!-- Ranking Selector -->
                  <div class="space-y-2 max-w-2xl mx-auto my-6">
                    <!-- Individual Ranks -->
                    <div v-if="currentSlide.type === 'vote_individual'">
                      <div v-for="(insId, rankIndex) in evaluationRanks" :key="insId" 
                           draggable="true"
                           @dragstart="onDragStart($event, rankIndex)"
                           @dragover.prevent="onDragOver"
                           @dragenter.prevent="onDragEnter($event, rankIndex)"
                           @dragend="onDragEnd"
                           @drop.prevent
                           class="flex items-center gap-3 bg-black/40 border border-white/5 p-3 rounded-xl transition-all hover:border-white/10 mb-2 cursor-grab active:cursor-grabbing select-none"
                           :class="{'opacity-40 border-dashed border-red-500/50 bg-red-950/10': dragIndex === rankIndex}">
                        
                        <!-- Drag Handle Icon -->
                        <div class="text-gray-500 pointer-events-none select-none flex items-center justify-center w-4 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 opacity-40">
                            <circle cx="9" cy="5" r="1" />
                            <circle cx="9" cy="12" r="1" />
                            <circle cx="9" cy="19" r="1" />
                            <circle cx="15" cy="5" r="1" />
                            <circle cx="15" cy="12" r="1" />
                            <circle cx="15" cy="19" r="1" />
                          </svg>
                        </div>

                        <span class="text-base font-black text-yellow-500 w-8 pointer-events-none select-none">{{ rankIndex + 1 }}.</span>
                        <div class="flex-1 pointer-events-none select-none">
                          <span class="font-bold text-gray-200">{{ getInstructorName(insId) }}</span>
                        </div>
                        <div class="bg-red-600/10 text-kahoot-red text-xs px-2.5 py-1 rounded border border-red-500/20 font-mono font-bold w-18 text-center pointer-events-none select-none">
                          +{{ [600, 500, 400, 300, 200, 100][rankIndex] }} b
                        </div>
                        <div class="flex items-center gap-1.5" @click.stop draggable="false">
                          <button @click="moveRank(rankIndex, -1)" :disabled="rankIndex === 0" draggable="false" class="bg-white/5 hover:bg-white/10 disabled:opacity-20 px-2 py-1 rounded font-bold text-xs cursor-pointer">▲</button>
                          <button @click="moveRank(rankIndex, 1)" :disabled="rankIndex === evaluationRanks.length - 1" draggable="false" class="bg-white/5 hover:bg-white/10 disabled:opacity-20 px-2 py-1 rounded font-bold text-xs cursor-pointer">▼</button>
                        </div>
                      </div>
                    </div>

                    <!-- Team Ranks -->
                    <div v-else-if="currentSlide.type === 'vote_team'">
                      <div v-for="(gId, rankIndex) in evaluationRanks" :key="gId" 
                           draggable="true"
                           @dragstart="onDragStart($event, rankIndex)"
                           @dragover.prevent="onDragOver"
                           @dragenter.prevent="onDragEnter($event, rankIndex)"
                           @dragend="onDragEnd"
                           @drop.prevent
                           class="flex items-center gap-3 bg-black/40 border border-white/5 p-3 rounded-xl transition-all hover:border-white/10 mb-2 cursor-grab active:cursor-grabbing select-none"
                           :class="{'opacity-40 border-dashed border-red-500/50 bg-red-950/10': dragIndex === rankIndex}">
                        
                        <!-- Drag Handle Icon -->
                        <div class="text-gray-500 pointer-events-none select-none flex items-center justify-center w-4 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 opacity-40">
                            <circle cx="9" cy="5" r="1" />
                            <circle cx="9" cy="12" r="1" />
                            <circle cx="9" cy="19" r="1" />
                            <circle cx="15" cy="5" r="1" />
                            <circle cx="15" cy="12" r="1" />
                            <circle cx="15" cy="19" r="1" />
                          </svg>
                        </div>

                        <span class="text-base font-black text-yellow-500 w-8 pointer-events-none select-none">{{ rankIndex + 1 }}.</span>
                        <div class="flex-1 pointer-events-none select-none">
                          <span class="font-bold text-gray-200">{{ getGroupName(gId) }}</span>
                          <p class="text-[10px] text-gray-400 mt-0.5">Členovia: {{ getGroupMemberNames(gId) }}</p>
                        </div>
                        <div class="bg-red-600/10 text-kahoot-red text-xs px-2.5 py-1 rounded border border-red-500/20 font-mono font-bold w-18 text-center pointer-events-none select-none">
                          +{{ getTeamPoints(rankIndex) }} b
                        </div>
                        <div class="flex items-center gap-1.5" @click.stop draggable="false">
                          <button @click="moveRank(rankIndex, -1)" :disabled="rankIndex === 0" draggable="false" class="bg-white/5 hover:bg-white/10 disabled:opacity-20 px-2 py-1 rounded font-bold text-xs cursor-pointer">▲</button>
                          <button @click="moveRank(rankIndex, 1)" :disabled="rankIndex === evaluationRanks.length - 1" draggable="false" class="bg-white/5 hover:bg-white/10 disabled:opacity-20 px-2 py-1 rounded font-bold text-xs cursor-pointer">▼</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="text-center mt-8">
                    <button @click="submitEvaluation" class="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-red-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                      Pripísať body a zobraziť leaderboard (Krok 5)
                    </button>
                  </div>
                </div>

                <!-- STEP 4: STANDINGS PODIUM -->
                <div v-if="currentSlide.currentStep === 4" class="text-center py-4">
                  <div class="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-5 py-2.5 rounded-full border border-blue-500/20 font-bold mb-6">
                    Krok 5: Body pripísané, leaderboard zobrazený
                  </div>
                  <p class="text-xs text-gray-400 mb-6 max-w-md mx-auto">Projektor teraz ukazuje stupne víťazov a celkové poradie s pripísanými bodmi.</p>
                  
                  <div class="bg-black/40 p-4 rounded-2xl border border-white/5 max-w-md mx-auto text-left text-sm text-gray-200 mb-6">
                    <h4 class="font-bold text-yellow-500 mb-2">Rozdelené body za toto kolo:</h4>
                    <div v-if="currentSlide.type === 'vote_individual'">
                      <ul class="list-decimal list-inside space-y-1 font-mono text-xs text-gray-300">
                        <li v-for="insId in currentSlide.rankings" :key="insId">
                          {{ getInstructorName(insId) }}
                        </li>
                      </ul>
                    </div>
                    <div v-else-if="currentSlide.type === 'vote_team'">
                      <ul class="list-decimal list-inside space-y-1 font-mono text-xs text-gray-300">
                        <li v-for="gId in currentSlide.rankings" :key="gId">
                          {{ getGroupName(gId) }} ({{ getGroupMemberNames(gId) }})
                        </li>
                      </ul>
                    </div>
                  </div>

                  <button @click="resetSlidePoints" class="bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-900/40 text-xs px-4 py-2 rounded-xl transition-all cursor-pointer">
                    Vziať späť body (odčítať a upraviť znova)
                  </button>
                </div>

              </div>

              <!-- SPECIAL VOTE TASK TYPE -->
              <div v-else-if="currentSlide?.type === 'special'">
                <!-- Step 1: Voting -->
                <div v-if="currentSlide.currentStep === 1" class="text-center py-6">
                  <div class="w-16 h-16 mx-auto mb-4 bg-red-600/10 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-gray-200 mb-2">Spustiť hlasovanie za tipovačku</h3>
                  
                  <!-- Start / Voting in progress -->
                  <div v-if="!state?.activeVote?.isOpen">
                    <button @click="startVote" class="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                      Spustiť hlasovanie
                    </button>
                  </div>
                  <div v-else>
                    <div class="inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-full border border-red-500/20 font-bold mb-4 animate-pulse">
                      Prebieha hlasovanie detí...
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 my-6 max-w-4xl mx-auto">
                      <div v-for="team in state?.teams" :key="team.id" 
                           class="p-3 rounded-xl border flex flex-col items-center justify-center transition-all"
                           :class="[
                             hasVoted(team.id) ? 'border-green-500/40 bg-green-950/20 text-white' : 'border-white/5 bg-white/5 text-gray-500',
                             isTeamOnline(team.id) ? '' : 'opacity-40'
                           ]">
                        <span class="text-[10px] font-bold truncate max-w-16 mb-1">{{ team.name }}</span>
                        <span class="text-xl font-bold">{{ hasVoted(team.id) ? '✓' : '...' }}</span>
                      </div>
                    </div>
                    <div class="flex gap-4 justify-center mt-6">
                      <button @click="closeVote" class="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg shadow-red-950/50 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                        Ukončiť hlasovanie (Zobraziť graf)
                      </button>
                      <button @click="resetVote" class="text-xs text-gray-400 hover:underline">
                        Reštartovať hlasovanie
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Step 2: Results -->
                <div v-if="currentSlide.currentStep === 2" class="text-center py-4">
                  <div class="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full border border-yellow-500/20 font-bold mb-4">
                    Výsledky hlasovania
                  </div>
                  <p class="text-xs text-gray-400 mb-6">Projektor teraz ukazuje stĺpcový graf s počtami tipov na inštruktorov.</p>
                  <button @click="resetVote" class="bg-neutral-800 hover:bg-neutral-700 border border-white/5 text-xs px-4 py-2 rounded-xl transition-all cursor-pointer">
                    Reštartovať hlasovanie znova
                  </button>
                </div>
              </div>

              <!-- SPECIAL RESOLVE TASK TYPE -->
              <div v-else-if="currentSlide?.type === 'special_resolve'">
                <!-- Step 0: Winner Selection -->
                <div v-if="currentSlide.currentStep === 0" class="py-4 text-center">
                  <h3 class="text-lg font-bold text-gray-200 mb-4">Vyhodnotenie: Kto vyhrá show?</h3>
                  <p class="text-xs text-gray-400 mb-6">Na projektore je blank slide.</p>
                  
                  <div class="max-w-md mx-auto bg-neutral-900 p-6 rounded-2xl border border-white/5 mb-8 text-left">
                    <label class="block text-xs font-bold text-gray-400 mb-2 uppercase">Víťazný inštruktor (líder show)</label>
                    <select v-model="currentSlide.winnerInstructorId" @change="updateState"
                            class="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 mb-6">
                      <option v-for="ins in state?.instructors" :key="ins.id" :value="ins.id">
                        {{ ins.name }}
                      </option>
                    </select>
                    
                    <!-- Tips breakdown list -->
                    <div class="space-y-3">
                      <span class="block text-xs font-bold text-gray-400 uppercase">Tipy detských tímov z 1. dňa:</span>
                      <div class="grid grid-cols-2 gap-3">
                        <div v-for="team in state?.teams" :key="team.id" class="p-2 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                          <span class="font-bold text-gray-300">{{ team.name }}:</span>
                          <span v-if="getSpecialVote(team.id)" 
                                :class="getSpecialVote(team.id) === currentSlide.winnerInstructorId ? 'text-green-400 font-extrabold' : 'text-gray-400 font-semibold'">
                            {{ getInstructorName(getSpecialVote(team.id)) }}
                          </span>
                          <span v-else class="text-red-500 font-semibold italic">Netipoval</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button @click="startResolveReveal" :disabled="!currentSlide.winnerInstructorId"
                          class="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-red-950/50">
                    Spustiť vyhlásenie víťaza!
                  </button>
                </div>

                <!-- Step 1: Countdown -->
                <div v-if="currentSlide.currentStep === 1" class="text-center py-12">
                  <div class="w-16 h-16 mx-auto mb-4 bg-red-600/10 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-200 mb-2">Odpočítavanie na projektore...</h3>
                  <p class="text-xs text-gray-400 mb-6">Projektor a klienti ukazujú 3 2 1 countdown. Po skončení to automaticky preskočí na vyhlásenie.</p>
                </div>

                <!-- Step 2: Resolved / Reveal -->
                <div v-if="currentSlide.currentStep === 2" class="text-center py-4">
                  <div class="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-5 py-2.5 rounded-full border border-blue-500/20 font-bold mb-6">
                    Body pripísané, víťaz zobrazený
                  </div>
                  <p class="text-sm text-gray-300 mb-6">
                    Víťaz šou: <strong class="text-yellow-400">{{ getInstructorName(currentSlide.winnerInstructorId) }}</strong>.
                    Detské tímy, ktoré tipovali správne, získali +600 bodov.
                  </p>
                  
                  <button @click="resetSlidePoints" class="bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-900/40 text-xs px-4 py-2 rounded-xl transition-all cursor-pointer">
                    Vziať späť body a reštartovať
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        <!-- Team votes card under current slide (for Step 2 and Step 3) -->
        <div v-if="currentSlide && (currentSlide.currentStep === 2 || currentSlide.currentStep === 3) && currentSlide.votes && Object.keys(currentSlide.votes).length > 0" 
             class="bg-neutral-900 rounded-3xl p-6 border border-white/5 shadow-2xl mt-6 animate-slide-up">
          <h3 class="text-sm font-extrabold text-yellow-500 uppercase tracking-wider mb-4">Hlasy tímov:</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div v-for="team in state?.teams" :key="team.id" class="bg-black/30 p-3 rounded-2xl border border-white/5 flex flex-col justify-between">
              <span class="text-xs font-bold text-gray-400 block mb-1.5 truncate">{{ team.name }}</span>
              <span class="text-sm font-bold text-white leading-tight">
                {{ currentSlide.votes[team.id] ? (currentSlide.type === 'vote_team' ? getGroupName(currentSlide.votes[team.id]) : getInstructorName(currentSlide.votes[team.id])) : 'Nehlasoval' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Standings preview card under current slide for leaderboards/resolves -->
        <div v-if="currentSlide && (
             currentSlide.type === 'leaderboard' || 
             currentSlide.type === 'leaderboard_instructors' || 
             currentSlide.type === 'leaderboard_teams' || 
             (currentSlide.type === 'special_resolve' && currentSlide.currentStep === 2) || 
             ((currentSlide.type === 'vote_individual' || currentSlide.type === 'vote_team') && currentSlide.currentStep === 4)
        )" class="bg-neutral-900 rounded-3xl p-6 border border-white/5 shadow-2xl mt-6 animate-slide-up">
          
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-extrabold text-yellow-500 uppercase tracking-wider">
              {{ 
                currentSlide.type === 'leaderboard_instructors'
                  ? 'Poradie inštruktorov na projektore:'
                  : currentSlide.type === 'leaderboard_teams'
                  ? 'Poradie tímov na projektore:'
                  : 'Poradie na projektore:'
              }}
            </h3>
          </div>

          <!-- If instructors standings are shown -->
          <div v-if="currentSlide.type === 'leaderboard' || currentSlide.type === 'leaderboard_instructors' || ((currentSlide.type === 'vote_individual' || currentSlide.type === 'vote_team') && currentSlide.currentStep === 4) || (currentSlide.type === 'special_resolve' && currentSlide.currentStep === 2)"
               class="mb-4">
            <h4 class="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Inštruktori:</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div v-for="ins in sortedInstructors" :key="ins.id" 
                   class="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center relative">
                <span class="absolute top-2 left-2 bg-yellow-500 text-gray-900 font-black rounded-full w-5 h-5 flex items-center justify-center text-[10px]">{{ ins.rank }}</span>
                <span class="font-bold text-white text-sm mt-2">{{ ins.name }}</span>
                <span class="text-xs text-yellow-500 font-bold mt-1">{{ ins.score }} b</span>
              </div>
            </div>
          </div>

          <!-- If teams standings are shown -->
          <div v-if="currentSlide.type === 'leaderboard' || currentSlide.type === 'leaderboard_teams' || (currentSlide.type === 'vote_team' && currentSlide.currentStep === 4) || (currentSlide.type === 'vote_individual' && currentSlide.currentStep === 4) || (currentSlide.type === 'special_resolve' && currentSlide.currentStep === 2)">
            <h4 class="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Tímy:</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              <div v-for="team in sortedTeams" :key="team.id" 
                   class="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center relative">
                <span class="absolute top-2 left-2 bg-blue-500 text-white font-black rounded-full w-5 h-5 flex items-center justify-center text-[10px]">{{ team.rank }}</span>
                <span class="font-bold text-white text-xs mt-2 truncate w-full text-center">{{ team.name }}</span>
                <span class="text-xs text-yellow-500 font-bold mt-1">{{ team.score }} b</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

      <!-- Right Sidebar: Live Standings & Actions -->
      <div :class="['bg-neutral-900 border-l border-white/5 flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden']"
           :style="{
             width: isRightSidebarOpen ? '18rem' : '0px',
             minWidth: isRightSidebarOpen ? '18rem' : '0px',
             opacity: isRightSidebarOpen ? '1' : '0'
           }">
         <!-- Sidebar Header -->
         <div class="p-4 border-b border-white/5 bg-neutral-950 flex items-center justify-between shrink-0">
           <span class="text-sm font-bold text-gray-200 uppercase tracking-wider">Aktuálne Skóre</span>
         </div>
         
         <!-- Scores Scroll Container -->
         <div class="flex-1 overflow-y-auto p-4 space-y-6">
           <!-- Teams List -->
           <div>
             <h3 class="text-xs uppercase font-extrabold text-blue-500 tracking-wider mb-3">Tímy</h3>
             <div class="space-y-2">
               <div v-for="team in sortedTeams" :key="team.id" class="flex justify-between items-center bg-black/20 border border-white/5 rounded-xl px-3.5 py-2.5">
                 <div class="flex items-center gap-2">
                   <span class="text-xs text-gray-500 font-bold w-5">{{ team.rank }}.</span>
                   <span class="font-bold text-gray-200 text-sm">{{ team.name }}</span>
                 </div>
                 <span class="font-mono font-extrabold text-yellow-400 text-sm">{{ team.score }} b</span>
               </div>
             </div>
           </div>

           <!-- Instructors List -->
           <div>
             <h3 class="text-xs uppercase font-extrabold text-red-500 tracking-wider mb-3">Inštruktori</h3>
             <div class="space-y-2">
               <div v-for="ins in sortedInstructors" :key="ins.id" class="flex justify-between items-center bg-black/20 border border-white/5 rounded-xl px-3.5 py-2.5">
                 <div class="flex items-center gap-2">
                   <span class="text-xs text-gray-500 font-bold w-5">{{ ins.rank }}.</span>
                   <span class="font-bold text-gray-200 text-sm">{{ ins.name }}</span>
                 </div>
                 <span class="font-mono font-extrabold text-yellow-400 text-sm">{{ ins.score }} b</span>
               </div>
             </div>
           </div>
         </div>

         <!-- Sidebar Footer / Actions -->
         <div class="p-4 border-t border-white/5 bg-neutral-950 shrink-0 space-y-2">
           <button @click="showManualCorrectionModal = true" class="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg">
             Manuálna korekcia
           </button>
           <button @click="showHistoryModal = true" class="w-full bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer border border-white/5">
             Zobraziť históriu
           </button>
         </div>
      </div>

    </template>
  </div>

  <!-- Modals Section -->
  <!-- Manual Correction Modal -->
  <transition name="fade">
    <div v-if="showManualCorrectionModal" class="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-neutral-900 rounded-3xl max-w-4xl w-full p-6 border border-white/10 shadow-2xl flex flex-col max-h-[85vh] transition-all transform scale-100 animate-slide-up">
        <div class="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
          <h2 class="text-xl font-bold text-gray-200 flex items-center gap-2">
            <span>Manuálna korekcia skóre</span>
          </h2>
          <button @click="showManualCorrectionModal = false" class="text-gray-400 hover:text-white text-2xl font-bold cursor-pointer">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-8 pr-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Instructors Scores -->
            <div>
              <h3 class="text-sm font-extrabold text-red-500 uppercase tracking-wider mb-4">Inštruktori</h3>
              <div class="space-y-2">
                <div v-for="ins in state?.instructors" :key="ins.id" 
                     class="flex items-center justify-between bg-black/30 px-4 py-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <span class="font-semibold text-gray-200">{{ ins.name }}</span>
                  <div class="flex items-center gap-3">
                    <span class="font-mono font-extrabold text-yellow-400 text-lg">{{ ins.score }} b</span>
                    <div class="flex gap-1">
                      <button @click="adjustScore('instructors', ins.id, -100)" class="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer">-100</button>
                      <button @click="adjustScore('instructors', ins.id, 100)" class="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer">+100</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Kids Teams Scores -->
            <div>
              <h3 class="text-sm font-extrabold text-blue-500 uppercase tracking-wider mb-4">Detské tímy</h3>
              <div class="space-y-2">
                <div v-for="team in state?.teams" :key="team.id" 
                     class="flex items-center justify-between bg-black/30 px-4 py-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <span class="font-semibold text-gray-200">{{ team.name }}</span>
                  <div class="flex items-center gap-3">
                    <span class="font-mono font-extrabold text-yellow-400 text-lg">{{ team.score }} b</span>
                    <div class="flex gap-1">
                      <button @click="adjustScore('teams', team.id, -100)" class="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer">-100</button>
                      <button @click="adjustScore('teams', team.id, 100)" class="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer">+100</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-white/5 text-right shrink-0">
          <button @click="showManualCorrectionModal = false" class="bg-neutral-800 hover:bg-neutral-700 text-gray-200 px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
            Zatvoriť
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- History Modal -->
  <transition name="fade">
    <div v-if="showHistoryModal" class="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-neutral-900 rounded-3xl max-w-4xl w-full p-6 border border-white/10 shadow-2xl flex flex-col max-h-[85vh] transition-all transform scale-100 animate-slide-up">
        <div class="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
          <h2 class="text-xl font-bold text-gray-200 flex items-center gap-2">
            <span>História akcií a skóre</span>
          </h2>
          <button @click="showHistoryModal = false" class="text-gray-400 hover:text-white text-2xl font-bold cursor-pointer">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto pr-1">
          <div v-if="!state?.history || state.history.length === 0" class="text-center py-12 text-gray-400 italic">
            História je zatiaľ prázdna.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-300">
              <thead class="text-xs uppercase bg-black/40 text-gray-400 border-b border-white/10">
                <tr>
                  <th class="px-4 py-3">Čas</th>
                  <th class="px-4 py-3">Akcia</th>
                  <th class="px-4 py-3">Typ</th>
                  <th class="px-4 py-3">Priebeh / Podrobnosti</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="item in [...state.history].reverse()" :key="item.id" class="hover:bg-white/5 transition-colors">
                  <td class="px-4 py-3 font-mono text-xs whitespace-nowrap">
                    {{ new Date(item.timestamp).toLocaleTimeString() }}
                  </td>
                  <td class="px-4 py-3 font-semibold text-white">
                    {{ item.type === 'manual' ? 'Manuálna korekcia' : item.slideTitle }}
                  </td>
                  <td class="px-4 py-3 text-xs">
                    <span v-if="item.type === 'manual'" class="bg-blue-600/20 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
                      Manuálna
                    </span>
                    <span v-else class="bg-green-600/20 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
                      Kolo
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div v-if="item.type === 'manual'" class="text-gray-300">
                      Úprava bodov pre <strong class="text-white">{{ item.recipient }}</strong> ({{ item.delta }})
                    </div>
                    <div v-else class="space-y-1">
                      <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Udelené body:</div>
                      <div class="flex flex-wrap gap-1.5 max-w-md">
                        <span v-for="d in item.details" :key="d.name" class="inline-flex items-center text-[10px] bg-white/5 border border-white/5 rounded px-1.5 py-0.5">
                          <strong class="text-white mr-1">{{ d.name }}</strong>
                          <span :class="d.type === 'instructor' ? 'text-red-400' : 'text-blue-400'" class="mr-1">
                            ({{ d.type === 'instructor' ? 'Inšt.' : 'Tím' }})
                          </span>
                          <span class="text-yellow-400 font-extrabold">+{{ d.points }}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-white/5 flex justify-between shrink-0">
          <button @click="clearHistory" class="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-900/40 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
            Vymazať históriu
          </button>
          <button @click="showHistoryModal = false" class="bg-neutral-800 hover:bg-neutral-700 text-gray-200 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
            Zatvoriť
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { socket } from '../socket';

const isAuthenticated = ref(sessionStorage.getItem('admin_authenticated') === 'true');
const authError = ref('');

const loginAdmin = () => {
  const password = prompt('Zadajte heslo pre admin prístup:');
  if (password === '787282') {
    isAuthenticated.value = true;
    sessionStorage.setItem('admin_authenticated', 'true');
    authError.value = '';
  } else if (password !== null) {
    alert('Nesprávne heslo!');
    authError.value = 'Nesprávne heslo!';
  }
};

const state = ref(null);
const activeLeftTab = ref('slides');
const showAddMenu = ref(false);
const isLeftSidebarOpen = ref(true);
const isRightSidebarOpen = ref(true);
const showManualCorrectionModal = ref(false);
const showHistoryModal = ref(false);

const teamVoteFormat = ref('3x2');
const localGroups = ref([]);
const evaluationRanks = ref([]);
const dragIndex = ref(null);
const specialWinnerId = ref('');

const sortedTeams = computed(() => {
  if (!state.value || !state.value.teams) return [];
  const list = [...state.value.teams].sort((a, b) => b.score - a.score);
  let currentRank = 1;
  return list.map((team, idx) => {
    if (idx > 0 && team.score < list[idx - 1].score) {
      currentRank = idx + 1;
    }
    return { ...team, rank: currentRank };
  });
});

const sortedInstructors = computed(() => {
  if (!state.value || !state.value.instructors) return [];
  const list = [...state.value.instructors].sort((a, b) => b.score - a.score);
  let currentRank = 1;
  return list.map((ins, idx) => {
    if (idx > 0 && ins.score < list[idx - 1].score) {
      currentRank = idx + 1;
    }
    return { ...ins, rank: currentRank };
  });
});

onMounted(() => {
  document.title = 'Admin';
  // Register with role admin
  socket.emit('client:register', { role: 'admin' });

  socket.on('connect', () => {
    socket.emit('client:register', { role: 'admin' });
  });

  socket.on('stateUpdate', (newState) => {
    state.value = newState;
    syncEvaluationRanks();
  });

  if (!isAuthenticated.value) {
    loginAdmin();
  }
});

const currentSlide = computed(() => {
  if (!state.value) return null;
  return state.value.slides[state.value.currentSlideIndex];
});

// Watch currentSlide to synchronize the evaluation/team list
watch(currentSlide, () => {
  syncEvaluationRanks();
});

const syncEvaluationRanks = () => {
  if (!state.value || !currentSlide.value) return;
  
  if (currentSlide.value.type === 'vote_individual') {
    if (currentSlide.value.rankings && currentSlide.value.rankings.length > 0) {
      evaluationRanks.value = [...currentSlide.value.rankings];
    } else {
      evaluationRanks.value = state.value.instructors.map(ins => ins.id);
    }
  } else if (currentSlide.value.type === 'vote_team') {
    teamVoteFormat.value = currentSlide.value.teamFormat || '3x2';
    localGroups.value = JSON.parse(JSON.stringify(currentSlide.value.teamGroups || []));
    
    if (currentSlide.value.rankings && currentSlide.value.rankings.length > 0) {
      evaluationRanks.value = [...currentSlide.value.rankings];
    } else {
      evaluationRanks.value = localGroups.value.map(g => g.id);
    }
  } else if (currentSlide.value.type === 'special') {
    specialWinnerId.value = currentSlide.value.winnerInstructorId || '';
  } else if (currentSlide.value.type === 'special_resolve') {
    specialWinnerId.value = currentSlide.value.winnerInstructorId || '';
  }
};

const getSpecialVote = (teamId) => {
  if (!state.value) return null;
  const initialSlide = state.value.slides.find(s => s.type === 'special');
  return initialSlide?.votes?.[teamId] || null;
};

const startResolveReveal = () => {
  if (!currentSlide.value || !currentSlide.value.winnerInstructorId) return;
  // Emit a single atomic event: saves winner + sets step 1 on server
  socket.emit('admin:startSpecialResolve', {
    slideId: currentSlide.value.id,
    slideIndex: state.value.currentSlideIndex,
    winnerInstructorId: currentSlide.value.winnerInstructorId
  });
};

// Select highest scoring instructor by default on resolve slide
watch(() => state.value?.currentSlideIndex, (newIdx) => {
  if (!state.value) return;
  const slide = state.value.slides[newIdx];
  if (slide && slide.type === 'special_resolve' && !slide.winnerInstructorId) {
    if (sortedInstructors.value.length > 0) {
      slide.winnerInstructorId = sortedInstructors.value[0].id;
      updateState();
    }
  }
});

// Auto-advance special resolve from Step 1 to Step 2 (award points after countdown)
watch(() => currentSlide.value?.currentStep, (newStep) => {
  if (currentSlide.value?.type === 'special_resolve' && newStep === 1) {
    setTimeout(() => {
      if (currentSlide.value && currentSlide.value.type === 'special_resolve' && currentSlide.value.currentStep === 1) {
        socket.emit('admin:resolveSpecialQuestion', {
          slideId: currentSlide.value.id,
          winnerInstructorId: currentSlide.value.winnerInstructorId
        });
      }
    }, 3500);
  }
});

const getInstructorName = (id) => {
  if (!state.value) return '';
  const ins = state.value.instructors.find(i => i.id === id);
  return ins ? ins.name : 'Neznámy';
};

const getGroupName = (id) => {
  const grp = localGroups.value.find(g => g.id === id);
  return grp ? grp.name : 'Neznámy tím';
};

const getGroupMemberNames = (id) => {
  const grp = localGroups.value.find(g => g.id === id);
  if (!grp) return '';
  return grp.members.map(mId => getInstructorName(mId)).join(', ');
};

const getTeamPoints = (idx) => {
  const is3x2 = teamVoteFormat.value === '3x2';
  const pointsMap = is3x2 ? [600, 400, 200] : [600, 300];
  return pointsMap[idx] || 0;
};

// Builder reorder slides
const moveSlide = (idx, dir) => {
  if (!state.value) return;
  const slides = [...state.value.slides];
  const targetIdx = idx + dir;
  if (targetIdx >= 0 && targetIdx < slides.length) {
    const temp = slides[idx];
    slides[idx] = slides[targetIdx];
    slides[targetIdx] = temp;
    
    // Adjust current index if selected slide moved
    if (state.value.currentSlideIndex === idx) {
      state.value.currentSlideIndex = targetIdx;
    } else if (state.value.currentSlideIndex === targetIdx) {
      state.value.currentSlideIndex = idx;
    }
    
    state.value.slides = slides;
    updateState();
  }
};

// Reorder ranking lists (Up / Down)
const moveRank = (idx, dir) => {
  const targetIdx = idx + dir;
  if (targetIdx >= 0 && targetIdx < evaluationRanks.value.length) {
    const ranks = [...evaluationRanks.value];
    const temp = ranks[idx];
    ranks[idx] = ranks[targetIdx];
    ranks[targetIdx] = temp;
    evaluationRanks.value = ranks;
  }
};

// Drag and Drop handlers for reordering rankings
const onDragStart = (event, index) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', index);
  }
  // Delay reactive update to prevent Chrome from instantly aborting the drag session
  setTimeout(() => {
    dragIndex.value = index;
  }, 0);
};

const onDragOver = (event) => {
  // Prevent default to allow drop
  if (event.preventDefault) {
    event.preventDefault();
  }
};

const onDragEnter = (event, toIndex) => {
  const fromIndex = dragIndex.value;
  if (fromIndex !== null && fromIndex !== toIndex) {
    const ranks = [...evaluationRanks.value];
    const [movedItem] = ranks.splice(fromIndex, 1);
    ranks.splice(toIndex, 0, movedItem);
    evaluationRanks.value = ranks;
    dragIndex.value = toIndex;
  }
};

const onDragEnd = () => {
  dragIndex.value = null;
};

// Set group formats and auto-split instructors when changed by the user
const handleTeamFormatChange = (newVal) => {
  if (!state.value || currentSlide.value?.type !== 'vote_team') return;
  const ins = state.value.instructors;
  
  if (newVal === '3x2') {
    localGroups.value = [
      { id: 'g1', name: 'Tím A', members: [ins[0].id, ins[1].id] },
      { id: 'g2', name: 'Tím B', members: [ins[2].id, ins[3].id] },
      { id: 'g3', name: 'Tím C', members: [ins[4].id, ins[5].id] }
    ];
  } else {
    localGroups.value = [
      { id: 'g1', name: 'Skupina A', members: [ins[0].id, ins[1].id, ins[2].id] },
      { id: 'g2', name: 'Skupina B', members: [ins[3].id, ins[4].id, ins[5].id] }
    ];
  }
  evaluationRanks.value = localGroups.value.map(g => g.id);
  saveTeamGroupConfig();
};

const getInstructorGroupId = (insId) => {
  const grp = localGroups.value.find(g => g.members.includes(insId));
  return grp ? grp.id : '';
};

const setInstructorGroup = (insId, newGroupId) => {
  localGroups.value.forEach(g => {
    g.members = g.members.filter(mId => mId !== insId);
  });
  const targetGrp = localGroups.value.find(g => g.id === newGroupId);
  if (targetGrp) {
    targetGrp.members.push(insId);
  }
  saveTeamGroupConfig();
};

const saveTeamGroupConfig = () => {
  if (currentSlide.value && currentSlide.value.type === 'vote_team') {
    currentSlide.value.teamFormat = teamVoteFormat.value;
    currentSlide.value.teamGroups = localGroups.value;
    updateState();
  }
};

// Flow commands
const updateState = () => {
  socket.emit('admin:updateState', state.value);
};

const toggleFreeze = () => {
  socket.emit('admin:toggleFreeze');
};

const goToSlide = (idx) => {
  socket.emit('admin:changeSlide', idx);
};

const prevSlide = () => {
  if (!state.value) return;
  const slide = currentSlide.value;
  if (slide && (slide.type === 'vote_individual' || slide.type === 'vote_team') && slide.currentStep > 0) {
    socket.emit('admin:setSlideStep', {
      slideIndex: state.value.currentSlideIndex,
      step: slide.currentStep - 1
    });
  } else if (state.value.currentSlideIndex > 0) {
    const prevIdx = state.value.currentSlideIndex - 1;
    const prevS = state.value.slides[prevIdx];
    socket.emit('admin:changeSlide', prevIdx);
    if (prevS && (prevS.type === 'vote_individual' || prevS.type === 'vote_team')) {
      socket.emit('admin:setSlideStep', {
        slideIndex: prevIdx,
        step: 4
      });
    }
  }
};

const nextSlide = () => {
  if (!state.value) return;
  const slide = currentSlide.value;
  if (slide && (slide.type === 'vote_individual' || slide.type === 'vote_team') && slide.currentStep < 4) {
    socket.emit('admin:setSlideStep', {
      slideIndex: state.value.currentSlideIndex,
      step: slide.currentStep + 1
    });
  } else if (state.value.currentSlideIndex < state.value.slides.length - 1) {
    const nextIdx = state.value.currentSlideIndex + 1;
    const nextS = state.value.slides[nextIdx];
    socket.emit('admin:changeSlide', nextIdx);
    if (nextS && (nextS.type === 'vote_individual' || nextS.type === 'vote_team')) {
      socket.emit('admin:setSlideStep', {
        slideIndex: nextIdx,
        step: 0
      });
    }
  }
};

const setStep = (step) => {
  if (currentSlide.value && state.value) {
    socket.emit('admin:setSlideStep', {
      slideIndex: state.value.currentSlideIndex,
      step
    });
  }
};

const addNewSlide = (type) => {
  showAddMenu.value = false;
  if (!state.value) return;

  const defaultTitles = {
    blank: 'Blank Slide',
    vote_individual: 'Individuálna úloha',
    vote_team: 'Tímová úloha',
    leaderboard: 'Priebežné poradie',
    leaderboard_instructors: 'Vyhodnotenie inštruktorov',
    leaderboard_teams: 'Vyhodnotenie tímov',
    special: 'Tipovačka',
    special_resolve: 'Vyhodnotenie tipovačky'
  };

  const newSlide = {
    id: 'slide_' + Date.now(),
    type,
    title: defaultTitles[type] || 'Úloha',
    votes: {},
    pointsAwarded: false,
    rankings: []
  };

  if (type === 'vote_individual' || type === 'vote_team') {
    newSlide.currentStep = 0;
  }

  if (type === 'special') {
    newSlide.currentStep = 1;
  }

  if (type === 'special_resolve') {
    newSlide.currentStep = 0;
  }

  if (type === 'vote_team') {
    const ins = state.value.instructors;
    newSlide.teamFormat = '3x2';
    newSlide.teamGroups = [
      { id: 'g1', name: 'Tím A', members: [ins[0].id, ins[1].id] },
      { id: 'g2', name: 'Tím B', members: [ins[2].id, ins[3].id] },
      { id: 'g3', name: 'Tím C', members: [ins[4].id, ins[5].id] }
    ];
  }

  state.value.slides.push(newSlide);
  updateState();
};

const deleteSlide = (idx) => {
  if (state.value && confirm("Naozaj zmazať tento slajd?")) {
    state.value.slides.splice(idx, 1);
    if (state.value.currentSlideIndex >= state.value.slides.length) {
      state.value.currentSlideIndex = Math.max(0, state.value.slides.length - 1);
    }
    updateState();
  }
};

// Vote control commands
const startVote = () => {
  if (!state.value || !currentSlide.value) return;
  if (currentSlide.value.type === 'vote_team') {
    saveTeamGroupConfig();
  }
  socket.emit('admin:setSlideStep', {
    slideIndex: state.value.currentSlideIndex,
    step: 1
  });
};

const closeVote = () => {
  socket.emit('admin:setSlideStep', {
    slideIndex: state.value.currentSlideIndex,
    step: 2
  });
};

const resetVote = () => {
  if (confirm("Naozaj chcete vynulovať hlasovanie? Súčasné hlasy budú vymazané.")) {
    socket.emit('admin:setSlideStep', {
      slideIndex: state.value.currentSlideIndex,
      step: 1
    });
  }
};

const submitEvaluation = () => {
  if (!currentSlide.value) return;

  if (currentSlide.value.type === 'special') {
    socket.emit('admin:resolveSpecialQuestion', {
      slideId: currentSlide.value.id,
      winnerInstructorId: specialWinnerId.value
    });
  } else {
    // Save rankings first
    socket.emit('admin:updateRankings', {
      slideId: currentSlide.value.id,
      rankings: [...evaluationRanks.value]
    });
    // Move to step 4 (which automatically awards points)
    socket.emit('admin:setSlideStep', {
      slideIndex: state.value.currentSlideIndex,
      step: 4
    });
  }
};

const resetSlidePoints = () => {
  if (confirm("Naozaj chcete odpočítať body za toto kolo?")) {
    socket.emit('admin:resetSlidePoints', { slideId: currentSlide.value.id });
  }
};

const adjustScore = (type, id, amount) => {
  socket.emit('admin:updateScores', {
    type,
    updates: { [id]: amount }
  });
};

const clearHistory = () => {
  if (confirm("Naozaj chcete natrvalo vymazať celú históriu akcií?")) {
    socket.emit('admin:clearHistory');
  }
};

const confirmResetAll = () => {
  if (confirm("POZOR: Naozaj chceš vymazať všetky body, vyhodnotenia a spustiť hru odznova? Akcia je nevratná!")) {
    socket.emit('admin:resetAllScores');
  }
};

// Connection Helpers
const isTeamOnline = (teamId) => {
  return !!state.value?.connectedClients?.teams[teamId];
};

const hasVoted = (teamId) => {
  return !!state.value?.activeVote?.votes[teamId];
};

const isTeamOnlineStr = (teamId) => {
  return isTeamOnline(teamId) ? 'online' : 'offline';
};

const getSlideBadgeClass = (type) => {
  const classes = {
    blank: 'bg-neutral-800 text-gray-400',
    special: 'bg-amber-600/30 text-amber-500 border border-amber-500/20',
    vote_individual: 'bg-red-600/20 text-red-500 border border-red-500/10',
    vote_team: 'bg-blue-600/20 text-blue-500 border border-blue-500/10',
    leaderboard: 'bg-pink-600/20 text-pink-400 border border-pink-500/10',
    leaderboard_instructors: 'bg-purple-600/20 text-purple-400 border border-purple-500/10',
    leaderboard_teams: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/10',
    special_resolve: 'bg-amber-600/30 text-amber-500 border border-amber-500/20'
  };
  return classes[type] || 'bg-gray-800 text-white';
};
</script>

<style scoped>
/* Sidebar and workspace transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Fade animation for modals */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide up animation for modal content */
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  0% {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Shake animation for incorrect password */
.animate-shake {
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

/* Drag and drop cursor rules to prevent text selection cursor and issues */
.cursor-grab, .cursor-grab * {
  cursor: grab !important;
  user-select: none !important;
  -webkit-user-select: none !important;
}
.active\:cursor-grabbing, .active\:cursor-grabbing * {
  cursor: grabbing !important;
}
</style>
