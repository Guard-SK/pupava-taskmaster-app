<template>
  <div class="min-h-screen bg-gradient-to-br from-neutral-950 via-red-950 to-neutral-950 text-white overflow-hidden flex flex-col items-center justify-center p-8 relative font-sans">
    
    <!-- Glowing background gold particles for leaderboard slides -->
    <div v-if="currentSlide?.type?.startsWith('leaderboard') || ((currentSlide?.type === 'vote_individual' || currentSlide?.type === 'vote_team') && currentSlide?.currentStep === 4)" class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div v-for="(p, i) in particles" :key="i"
           class="gold-particle"
           :style="{ 
             left: p.left, 
             animationDelay: p.delay, 
             animationDuration: p.duration, 
             width: p.size, 
             height: p.size 
           }"></div>
    </div>

    <div v-if="!state" class="flex flex-col items-center gap-6">
      <div class="w-20 h-20 border-4 border-kahoot-red border-t-transparent rounded-full animate-spin"></div>
      <h1 class="text-3xl font-bold tracking-wider animate-pulse">Čakám na synchronizáciu...</h1>
    </div>

    <!-- Main Slide Switcher -->
    <transition name="slide-up" mode="out-in" v-else>
      
      <!-- 1. BLANK OR STEP 0/3 OF TASKS -->
      <div v-if="currentSlide?.type === 'blank' || 
                 ((currentSlide?.type === 'vote_individual' || currentSlide?.type === 'vote_team') && 
                  (currentSlide?.currentStep === 0 || currentSlide?.currentStep === 3))" 
           :key="'blank'" 
           class="flex flex-col items-center justify-center w-full h-full opacity-20">
      </div>
      <!-- 2a. VYHODNOTENIE INŠTRUKTOROV (leaderboard_instructors) -->
      <div v-else-if="currentSlide?.type === 'leaderboard_instructors'" 
           :key="'leaderboard_instructors'" 
           class="w-full max-w-6xl flex flex-col items-center justify-between h-[82vh] max-h-[82vh] select-none">
        
        <h1 class="text-4xl md:text-5xl font-extrabold font-display uppercase tracking-widest text-center bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] shrink-0 my-2">
          Vyhodnotenie Inštruktorov
        </h1>

        <!-- Podium style layout with pedestals -->
        <div class="flex items-end justify-center gap-6 w-full px-6 my-8 shrink-0 min-h-[420px]">
          
          <!-- 2nd Place Slot -->
          <div v-if="rankedInstructors[1]" 
               class="flex flex-col items-center reveal-transition transform"
               :class="isInstructorRevealed(rankedInstructors[1].rank) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-36 scale-75'">
            <!-- Crown/Spacer hovering -->
            <div class="flex flex-col items-center select-none">
              <div v-if="rankedInstructors[1].rank === 1" class="text-4xl animate-bounce mb-1">👑</div>
              <div v-else class="h-11"></div>
              <!-- Avatar hovering -->
              <div class="relative z-10 -mb-5">
                <img v-if="hasImage(rankedInstructors[1].name)" 
                     :src="getInstructorImage(rankedInstructors[1].name)" 
                     class="rounded-full object-cover shadow-xl border-4"
                     :class="getFinalRankStyles(rankedInstructors[1].rank).avatarClass" />
                <div v-else class="rounded-full flex items-center justify-center font-extrabold shadow-inner border-4"
                     :class="getFinalRankStyles(rankedInstructors[1].rank).avatarPlaceholderClass">
                  {{ rankedInstructors[1].name.charAt(0) }}
                </div>
                <span class="absolute -top-1.5 -right-1.5 font-black rounded-full flex items-center justify-center shadow leading-none border"
                      :class="getFinalRankStyles(rankedInstructors[1].rank).badgeClass">
                  {{ rankedInstructors[1].rank }}
                </span>
              </div>
            </div>
            <!-- Pedestal Column -->
            <div class="rounded-t-xl rounded-b-2xl shadow-2xl flex flex-col items-center justify-end pb-4 px-3 border border-white/10"
                 :class="getFinalRankStyles(rankedInstructors[1].rank).pedestalClass">
              <span class="truncate text-center w-full mb-1" :class="getFinalRankStyles(rankedInstructors[1].rank).nameClass">{{ rankedInstructors[1].name }}</span>
              <span class="font-black" :class="getFinalRankStyles(rankedInstructors[1].rank).scoreClass">{{ rankedInstructors[1].score }} b</span>
            </div>
          </div>

          <!-- 1st Place Slot -->
          <div v-if="rankedInstructors[0]" 
               class="flex flex-col items-center scale-105 reveal-transition transform"
               :class="isInstructorRevealed(rankedInstructors[0].rank) ? 'opacity-100 translate-y-0 scale-105' : 'opacity-0 translate-y-36 scale-75'">
            <!-- Crown & Avatar hovering -->
            <div class="relative z-10 -mb-6 flex flex-col items-center">
              <div v-if="rankedInstructors[0].rank === 1" class="text-4xl animate-bounce mb-1 select-none">👑</div>
              <div v-else class="h-11 select-none"></div>
              <div class="relative">
                <img v-if="hasImage(rankedInstructors[0].name)" 
                     :src="getInstructorImage(rankedInstructors[0].name)" 
                     class="rounded-full object-cover border-4 shadow-xl"
                     :class="getFinalRankStyles(rankedInstructors[0].rank).avatarClass" />
                <div v-else class="rounded-full flex items-center justify-center font-extrabold shadow-inner border-4"
                     :class="getFinalRankStyles(rankedInstructors[0].rank).avatarPlaceholderClass">
                  {{ rankedInstructors[0].name.charAt(0) }}
                </div>
                <span class="absolute -top-1.5 -right-1.5 font-black rounded-full flex items-center justify-center shadow leading-none border"
                      :class="getFinalRankStyles(rankedInstructors[0].rank).badgeClass">
                  {{ rankedInstructors[0].rank }}
                </span>
              </div>
            </div>
            <!-- Pedestal Column -->
            <div class="rounded-t-xl rounded-b-2xl shadow-2xl flex flex-col items-center justify-end pb-5 px-3 border border-white/10 relative overflow-hidden"
                 :class="getFinalRankStyles(rankedInstructors[0].rank).pedestalClass">
              <div v-if="rankedInstructors[0].rank === 1" class="absolute inset-0 bg-yellow-500/5 animate-pulse pointer-events-none"></div>
              <span class="truncate text-center w-full mb-1 drop-shadow" :class="getFinalRankStyles(rankedInstructors[0].rank).nameClass">{{ rankedInstructors[0].name }}</span>
              <span class="font-black drop-shadow" :class="getFinalRankStyles(rankedInstructors[0].rank).scoreClass">{{ rankedInstructors[0].score }} b</span>
            </div>
          </div>

          <!-- 3rd Place Slot -->
          <div v-if="rankedInstructors[2]" 
               class="flex flex-col items-center reveal-transition transform"
               :class="isInstructorRevealed(rankedInstructors[2].rank) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-36 scale-75'">
            <!-- Crown/Spacer hovering -->
            <div class="flex flex-col items-center select-none">
              <div v-if="rankedInstructors[2].rank === 1" class="text-4xl animate-bounce mb-1">👑</div>
              <div v-else class="h-11"></div>
              <!-- Avatar hovering -->
              <div class="relative z-10 -mb-5">
                <img v-if="hasImage(rankedInstructors[2].name)" 
                     :src="getInstructorImage(rankedInstructors[2].name)" 
                     class="rounded-full object-cover shadow-xl border-4"
                     :class="getFinalRankStyles(rankedInstructors[2].rank).avatarClass" />
                <div v-else class="rounded-full flex items-center justify-center font-extrabold shadow-inner border-4"
                     :class="getFinalRankStyles(rankedInstructors[2].rank).avatarPlaceholderClass">
                  {{ rankedInstructors[2].name.charAt(0) }}
                </div>
                <span class="absolute -top-1.5 -right-1.5 font-black rounded-full flex items-center justify-center shadow leading-none border"
                      :class="getFinalRankStyles(rankedInstructors[2].rank).badgeClass">
                  {{ rankedInstructors[2].rank }}
                </span>
              </div>
            </div>
            <!-- Pedestal Column -->
            <div class="rounded-t-xl rounded-b-2xl shadow-2xl flex flex-col items-center justify-end pb-4 px-3 border border-white/10"
                 :class="getFinalRankStyles(rankedInstructors[2].rank).pedestalClass">
              <span class="truncate text-center w-full mb-1" :class="getFinalRankStyles(rankedInstructors[2].rank).nameClass">{{ rankedInstructors[2].name }}</span>
              <span class="font-black" :class="getFinalRankStyles(rankedInstructors[2].rank).scoreClass">{{ rankedInstructors[2].score }} b</span>
            </div>
          </div>

        </div>

        <!-- Other Instructors (4-6 places) -->
        <div class="flex justify-center gap-4 w-full max-w-4xl my-4 shrink-0">
          <div v-for="(ins, index) in rankedInstructors.slice(3)" :key="ins.id" 
               class="glass rounded-2xl px-6 py-3 flex items-center gap-4 flex-1 justify-between border border-white/5 shadow-md text-base hover:bg-white/10 reveal-transition transform"
               :class="isInstructorRevealed(ins.rank) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'">
            <div class="flex items-center gap-3">
              <span class="text-gray-400 font-extrabold text-lg">{{ ins.rank }}.</span>
              <img v-if="hasImage(ins.name)" 
                   :src="getInstructorImage(ins.name)" 
                   class="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm" />
              <div v-else class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold border border-white/20">
                {{ ins.name.charAt(0) }}
              </div>
              <span class="font-bold text-gray-200 text-lg">{{ ins.name }}</span>
            </div>
            <span class="font-black text-yellow-400 text-xl">{{ ins.score }} b</span>
          </div>
        </div>
      </div>

      <!-- 2b. VYHODNOTENIE TÍMOV (leaderboard_teams) -->
      <div v-else-if="currentSlide?.type === 'leaderboard_teams'" 
           :key="'leaderboard_teams'" 
           class="w-full max-w-6xl flex flex-col items-center justify-between h-[82vh] max-h-[82vh] select-none">
        
        <h1 class="text-4xl md:text-5xl font-extrabold font-display uppercase tracking-widest text-center bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] shrink-0 my-2">
          Vyhodnotenie Tímov
        </h1>

        <!-- Podium layout with pedestals -->
        <div class="flex items-end justify-center gap-6 w-full px-6 my-8 shrink-0 min-h-[420px]">
          
          <!-- 2nd Place Team -->
          <div v-if="rankedTeams[1]" 
               class="flex flex-col items-center reveal-transition transform"
               :class="isTeamRevealed(rankedTeams[1].rank) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-36 scale-75'">
            <!-- Medal hovering -->
            <div class="relative z-10 -mb-5">
              <div class="relative flex flex-col items-center">
                <div :class="getFinalTeamRankStyles(rankedTeams[1].rank).badgeContainerClass">
                  <span :class="getFinalTeamRankStyles(rankedTeams[1].rank).symbolSizeClass">{{ getFinalTeamRankStyles(rankedTeams[1].rank).symbol }}</span>
                  <span class="absolute -top-1 -right-1 font-black rounded-full flex items-center justify-center shadow leading-none border"
                        :class="getFinalTeamRankStyles(rankedTeams[1].rank).badgeNumClass">
                    {{ rankedTeams[1].rank }}
                  </span>
                </div>
              </div>
            </div>
            <!-- Pedestal Column -->
            <div class="rounded-t-xl rounded-b-2xl shadow-2xl flex flex-col items-center justify-end pb-4 px-3 border border-white/10"
                 :class="getFinalTeamRankStyles(rankedTeams[1].rank).pedestalClass">
              <span class="truncate text-center w-full mb-1"
                    :class="getFinalTeamRankStyles(rankedTeams[1].rank).nameClass">{{ rankedTeams[1].name }}</span>
              <span class="font-black"
                    :class="getFinalTeamRankStyles(rankedTeams[1].rank).scoreClass">{{ rankedTeams[1].score }} b</span>
            </div>
          </div>

          <!-- 1st Place Team -->
          <div v-if="rankedTeams[0]" 
               class="flex flex-col items-center scale-105 reveal-transition transform"
               :class="isTeamRevealed(rankedTeams[0].rank) ? 'opacity-100 translate-y-0 scale-105' : 'opacity-0 translate-y-36 scale-75'">
            <!-- Cup hovering -->
            <div class="relative z-10 -mb-6 flex flex-col items-center">
              <div class="relative">
                <div :class="getFinalTeamRankStyles(rankedTeams[0].rank).badgeContainerClass">
                  <span :class="getFinalTeamRankStyles(rankedTeams[0].rank).symbolSizeClass">{{ getFinalTeamRankStyles(rankedTeams[0].rank).symbol }}</span>
                  <span class="absolute -top-1 -right-1 font-black rounded-full flex items-center justify-center shadow leading-none border"
                        :class="getFinalTeamRankStyles(rankedTeams[0].rank).badgeNumClass">
                    {{ rankedTeams[0].rank }}
                  </span>
                </div>
              </div>
            </div>
            <!-- Pedestal Column -->
            <div class="rounded-t-xl rounded-b-2xl shadow-2xl flex flex-col items-center justify-end pb-5 px-3 border border-white/10 relative overflow-hidden"
                 :class="getFinalTeamRankStyles(rankedTeams[0].rank).pedestalClass">
              <div v-if="rankedTeams[0].rank === 1" class="absolute inset-0 bg-yellow-500/5 animate-pulse pointer-events-none"></div>
              <span class="truncate text-center w-full mb-1 drop-shadow"
                    :class="getFinalTeamRankStyles(rankedTeams[0].rank).nameClass">{{ rankedTeams[0].name }}</span>
              <span class="font-black drop-shadow"
                    :class="getFinalTeamRankStyles(rankedTeams[0].rank).scoreClass">{{ rankedTeams[0].score }} b</span>
            </div>
          </div>

          <!-- 3rd Place Team -->
          <div v-if="rankedTeams[2]" 
               class="flex flex-col items-center reveal-transition transform"
               :class="isTeamRevealed(rankedTeams[2].rank) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-36 scale-75'">
            <!-- Medal hovering -->
            <div class="relative z-10 -mb-5">
              <div class="relative flex flex-col items-center">
                <div :class="getFinalTeamRankStyles(rankedTeams[2].rank).badgeContainerClass">
                  <span :class="getFinalTeamRankStyles(rankedTeams[2].rank).symbolSizeClass">{{ getFinalTeamRankStyles(rankedTeams[2].rank).symbol }}</span>
                  <span class="absolute -top-1 -right-1 font-black rounded-full flex items-center justify-center shadow leading-none border"
                        :class="getFinalTeamRankStyles(rankedTeams[2].rank).badgeNumClass">
                    {{ rankedTeams[2].rank }}
                  </span>
                </div>
              </div>
            </div>
            <!-- Pedestal Column -->
            <div class="rounded-t-xl rounded-b-2xl shadow-2xl flex flex-col items-center justify-end pb-4 px-3 border border-white/10"
                 :class="getFinalTeamRankStyles(rankedTeams[2].rank).pedestalClass">
              <span class="truncate text-center w-full mb-1"
                    :class="getFinalTeamRankStyles(rankedTeams[2].rank).nameClass">{{ rankedTeams[2].name }}</span>
              <span class="font-black"
                    :class="getFinalTeamRankStyles(rankedTeams[2].rank).scoreClass">{{ rankedTeams[2].score }} b</span>
            </div>
          </div>

        </div>

        <!-- Other Teams (4-6 places) -->
        <div class="flex justify-center gap-4 w-full max-w-3xl my-4 shrink-0">
          <div v-for="(team, index) in rankedTeams.slice(3)" :key="team.id" 
               class="glass rounded-xl p-3 flex items-center justify-between border border-white/5 shadow-sm text-sm hover:bg-white/10 reveal-transition transform flex-1"
               :class="isTeamRevealed(team.rank) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'">
            <div class="flex items-center gap-2">
              <span class="text-gray-400 font-bold">{{ team.rank }}.</span>
              <span class="font-bold text-gray-200">{{ team.name }}</span>
            </div>
            <span class="font-extrabold text-yellow-500">{{ team.score }} b</span>
          </div>
        </div>
      </div>

      <!-- 2c. COMBINED LEADERBOARD (original leaderboard or individual/team vote step 4) -->
      <div v-else-if="currentSlide?.type === 'leaderboard' || 
                       ((currentSlide?.type === 'vote_individual' || currentSlide?.type === 'vote_team') && currentSlide?.currentStep === 4)" 
           :key="'leaderboard'" 
           class="w-full max-w-6xl flex flex-col items-center justify-between h-[82vh] max-h-[82vh] select-none">
        
        <!-- Header -->
        <h1 class="text-4xl md:text-5xl font-extrabold font-display uppercase tracking-widest text-center bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] shrink-0 my-1">
          Priebežné Poradie
        </h1>
        
        <!-- Instructors Top (Podium style layout) -->
        <div class="flex items-end justify-center gap-5 w-full px-6 my-2 shrink-0">
          
          <!-- 2nd Place Slot (Index 1) -->
          <div v-if="rankedInstructors[1]" 
               :class="[
                 'glass-dark rounded-2xl flex flex-col items-center transform hover:-translate-y-1 transition-all duration-500 relative shrink-0',
                 getInstructorPodiumStyles(rankedInstructors[1]).cardClass
               ]">
            <div class="relative mb-2 shrink-0">
              <img v-if="hasImage(rankedInstructors[1].name)" 
                   :src="getInstructorImage(rankedInstructors[1].name)" 
                   class="rounded-full object-cover shadow-md"
                   :class="[
                     getInstructorPodiumStyles(rankedInstructors[1]).avatarBorder,
                     getInstructorPodiumStyles(rankedInstructors[1]).avatarSize
                   ]" />
              <div v-else class="rounded-full bg-slate-400 flex items-center justify-center text-gray-900 font-extrabold text-xl shadow-inner"
                   :class="[
                     getInstructorPodiumStyles(rankedInstructors[1]).avatarBorder,
                     getInstructorPodiumStyles(rankedInstructors[1]).avatarSize
                   ]">
                {{ rankedInstructors[1].name.charAt(0) }}
              </div>
              <span class="absolute -top-1.5 -right-1.5 font-black rounded-full w-5 h-5 flex items-center justify-center shadow text-[10px] leading-none"
                    :class="getInstructorPodiumStyles(rankedInstructors[1]).badgeClass">
                {{ rankedInstructors[1].rank }}
              </span>
            </div>
            <span class="truncate text-center w-full" :class="getInstructorPodiumStyles(rankedInstructors[1]).nameClass">{{ rankedInstructors[1].name }}</span>
            <span class="mt-1" :class="getInstructorPodiumStyles(rankedInstructors[1]).scoreClass">{{ rankedInstructors[1].score }} b</span>
          </div>

          <!-- 1st Place Slot (Index 0) -->
          <div v-if="rankedInstructors[0]" 
               :class="[
                 'glass-dark rounded-2xl flex flex-col items-center transform hover:-translate-y-1 transition-all duration-500 relative shrink-0',
                 getInstructorPodiumStyles(rankedInstructors[0]).cardClass
               ]">
            <div class="relative mb-2 shrink-0">
              <img v-if="hasImage(rankedInstructors[0].name)" 
                   :src="getInstructorImage(rankedInstructors[0].name)" 
                   class="rounded-full object-cover shadow-lg"
                   :class="[
                     getInstructorPodiumStyles(rankedInstructors[0]).avatarBorder,
                     getInstructorPodiumStyles(rankedInstructors[0]).avatarSize
                   ]" />
              <div v-else class="rounded-full bg-yellow-500 flex items-center justify-center text-gray-900 font-extrabold text-2xl shadow-inner"
                   :class="[
                     getInstructorPodiumStyles(rankedInstructors[0]).avatarBorder,
                     getInstructorPodiumStyles(rankedInstructors[0]).avatarSize
                   ]">
                {{ rankedInstructors[0].name.charAt(0) }}
              </div>
              <span class="absolute -top-2 -right-2 font-black rounded-full w-6 h-6 flex items-center justify-center shadow text-[11px] leading-none"
                    :class="getInstructorPodiumStyles(rankedInstructors[0]).badgeClass">
                {{ rankedInstructors[0].rank }}
              </span>
            </div>
            <span class="truncate text-center w-full" :class="getInstructorPodiumStyles(rankedInstructors[0]).nameClass">{{ rankedInstructors[0].name }}</span>
            <span class="mt-1" :class="getInstructorPodiumStyles(rankedInstructors[0]).scoreClass">{{ rankedInstructors[0].score }} b</span>
          </div>

          <!-- 3rd Place Slot (Index 2) -->
          <div v-if="rankedInstructors[2]" 
               :class="[
                 'glass-dark rounded-2xl flex flex-col items-center transform hover:-translate-y-1 transition-all duration-500 relative shrink-0',
                 getInstructorPodiumStyles(rankedInstructors[2]).cardClass
               ]">
            <div class="relative mb-2 shrink-0">
              <img v-if="hasImage(rankedInstructors[2].name)" 
                   :src="getInstructorImage(rankedInstructors[2].name)" 
                   class="rounded-full object-cover shadow-md"
                   :class="[
                     getInstructorPodiumStyles(rankedInstructors[2]).avatarBorder,
                     getInstructorPodiumStyles(rankedInstructors[2]).avatarSize
                   ]" />
              <div v-else class="rounded-full bg-amber-700 flex items-center justify-center text-white font-extrabold text-xl shadow-inner"
                   :class="[
                     getInstructorPodiumStyles(rankedInstructors[2]).avatarBorder,
                     getInstructorPodiumStyles(rankedInstructors[2]).avatarSize
                   ]">
                {{ rankedInstructors[2].name.charAt(0) }}
              </div>
              <span class="absolute -top-1.5 -right-1.5 font-black rounded-full w-5 h-5 flex items-center justify-center shadow text-[10px] leading-none"
                    :class="getInstructorPodiumStyles(rankedInstructors[2]).badgeClass">
                {{ rankedInstructors[2].rank }}
              </span>
            </div>
            <span class="truncate text-center w-full" :class="getInstructorPodiumStyles(rankedInstructors[2]).nameClass">{{ rankedInstructors[2].name }}</span>
            <span class="mt-1" :class="getInstructorPodiumStyles(rankedInstructors[2]).scoreClass">{{ rankedInstructors[2].score }} b</span>
          </div>

        </div>

        <!-- Other Instructors (4-6 places) -->
        <div class="flex justify-center gap-3 w-full max-w-3xl my-2 shrink-0">
          <div v-for="(ins, index) in rankedInstructors.slice(3)" :key="ins.id" 
               class="glass rounded-xl px-4 py-2 flex items-center gap-3 flex-1 justify-between border border-white/5 shadow-sm text-sm">
            <div class="flex items-center gap-2">
              <span class="text-gray-400 font-bold">{{ ins.rank }}.</span>
              <span class="font-bold text-gray-200">{{ ins.name }}</span>
            </div>
            <span class="font-extrabold text-yellow-500">{{ ins.score }} b</span>
          </div>
        </div>

        <!-- Kids Teams Bottom (1 row of 6) -->
        <div class="w-full max-w-5xl my-2 shrink-0">
          <h2 class="text-base font-bold text-center text-gray-400 mb-2.5 uppercase tracking-wider">Tímy</h2>
          <div class="grid grid-cols-6 gap-3 w-full">
            <div v-for="(team, index) in rankedTeams" :key="team.id" 
                 class="glass rounded-xl p-2.5 px-4 flex items-center gap-3 relative overflow-hidden transition-all duration-300 hover:scale-102"
                 :class="index === 0 ? 'border border-yellow-500/40 shadow-yellow-500/5' : 'border border-white/5'">
              <!-- Large Rank Circle -->
              <span :class="[
                'w-8 h-8 flex items-center justify-center bg-white/10 rounded-full font-black text-sm shadow-sm border border-white/5 shrink-0',
                getTeamRankColor(team.rank - 1)
              ]">
                {{ team.rank }}
              </span>
              <!-- Details -->
              <div class="flex-1 min-w-0 text-left">
                <span class="text-sm font-bold text-white block truncate leading-tight">{{ team.name }}</span>
                <span class="text-base font-extrabold text-yellow-400 block mt-0.5 leading-none">{{ team.score }} b</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. ACTIVE VOTING (STEP 1 OF TASKS, OR SPECIAL RUNNING) -->
      <div v-else-if="(currentSlide?.type === 'vote_individual' || currentSlide?.type === 'vote_team' || currentSlide?.type === 'special') && 
                       currentSlide?.currentStep === 1" 
           :key="'vote'" 
           class="w-full max-w-6xl flex flex-col items-center">
        
        <!-- Task Title -->
        <h1 class="text-5xl md:text-6xl font-extrabold mb-12 text-center leading-tight font-display drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] max-w-6xl">
          {{ currentSlide?.title }}
        </h1>

        <!-- Countdown Intro Overlay -->
        <div v-if="introCountdown > 0" class="flex flex-col items-center justify-center my-12 h-64">
          <div :key="introCountdown" class="countdown-number text-[12rem] md:text-[16rem] font-black text-yellow-500 font-display drop-shadow-[0_0_60px_rgba(234,179,8,0.6)]">
            {{ introCountdown }}
          </div>
        </div>

        <!-- Option Cards Grid (revealed when countdown finishes) -->
        <div v-else :class="[
          'grid gap-6 w-full justify-center px-4',
          state.activeVote?.options?.length === 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl'
        ]">
          <div v-for="(opt, index) in state.activeVote?.options" :key="opt.id"
               :class="[
                 'rounded-3xl p-6 flex flex-col items-center justify-center min-h-[190px] border-b-8 shadow-xl',
                 getOptionBgClass(index)
               ]">
            
            <!-- Avatar Display -->
            <div class="mb-4">
              <!-- If individual instructor -->
              <div v-if="isInstructorOption(opt.id)" class="flex justify-center">
                <img v-if="hasImage(getInstructorName(opt.id))" 
                     :src="getInstructorImage(getInstructorName(opt.id))" 
                     class="w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-md" />
                <div v-else class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold border-2 border-white/20 shadow-inner">
                  {{ getInstructorName(opt.id).charAt(0) }}
                </div>
              </div>
              <!-- If team group -->
              <div v-else class="flex justify-center -space-x-4">
                <div v-for="mId in getGroupMembers(opt.id)" :key="mId">
                  <img v-if="hasImage(getInstructorName(mId))" 
                       :src="getInstructorImage(getInstructorName(mId))" 
                       class="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-md hover:z-10" />
                  <div v-else class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold border-2 border-white/20 shadow-inner hover:z-10">
                    {{ getInstructorName(mId).charAt(0) }}
                  </div>
                </div>
              </div>
            </div>

            <span class="text-2xl md:text-3xl text-white! font-extrabold text-center leading-snug drop-shadow-md">
              {{ opt.name || opt.title }}
            </span>
          </div>
        </div>
      </div>

      <!-- 3b. SPECIAL RESOLVE COUNTDOWN (step 1 only) -->
      <div v-else-if="currentSlide?.type === 'special_resolve' && currentSlide?.currentStep === 1"
           :key="'special_resolve_countdown'"
           class="w-full max-w-6xl flex flex-col items-center">
        <h1 class="text-5xl md:text-6xl font-extrabold mb-12 text-center leading-tight font-display drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] max-w-6xl">
          Kto vyhrá dnešnú šou?
        </h1>
        <div v-if="resolveCountdown > 0" class="flex flex-col items-center justify-center my-12 h-64">
          <div :key="resolveCountdown" class="countdown-number text-[12rem] md:text-[16rem] font-black text-yellow-500 font-display drop-shadow-[0_0_60px_rgba(234,179,8,0.6)]">
            {{ resolveCountdown }}
          </div>
        </div>
      </div>

      <!-- 3c. SPECIAL RESOLVE WINNER REVEAL (step 2) -->
      <div v-else-if="currentSlide?.type === 'special_resolve' && currentSlide?.currentStep === 2"
           :key="'special_resolve_reveal'"
           class="w-full max-w-6xl flex flex-col items-center animate-slide-up text-center px-6">
        <h1 class="text-3xl md:text-4xl font-bold uppercase text-yellow-500 tracking-wider mb-2">Vyhodnotenie</h1>
        <h2 class="text-4xl md:text-5xl font-black text-white font-display leading-tight drop-shadow-lg mb-12">
          Kto vyhrá dnešnú šou?
        </h2>

        <!-- Winner card -->
        <div class="flex flex-col items-center bg-yellow-500/10 border-2 border-yellow-500 rounded-3xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(250,204,21,0.25)] mb-12">
          <div class="relative mb-6">
            <img v-if="hasImage(getInstructorName(currentSlide.winnerInstructorId))" 
                 :src="getInstructorImage(getInstructorName(currentSlide.winnerInstructorId))" 
                 class="w-40 h-40 rounded-full object-cover border-4 border-yellow-500 shadow-2xl" />
            <div v-else class="w-40 h-40 rounded-full bg-yellow-500 flex items-center justify-center text-gray-900 font-extrabold text-6xl border-4 border-white shadow-2xl">
              {{ getInstructorName(currentSlide.winnerInstructorId)?.charAt(0) }}
            </div>
            <!-- Gold crown overlay -->
            <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl">&#x1F451;</div>
          </div>
          <span class="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-1">Víťaz šou</span>
          <span class="text-white text-5xl font-black">{{ getInstructorName(currentSlide.winnerInstructorId) }}</span>
        </div>

        <!-- Correct teams -->
        <div class="w-full max-w-3xl">
          <div v-if="getCorrectTeams(currentSlide.winnerInstructorId).length > 0" class="space-y-4">
            <h3 class="text-2xl font-bold text-green-400">Tieto tímy hádali správne a dostávajú +600 bodov:</h3>
            <div class="flex flex-wrap justify-center gap-4 mt-4">
              <span v-for="team in getCorrectTeams(currentSlide.winnerInstructorId)" :key="team.id"
                    class="bg-green-600/20 text-green-400 border-2 border-green-500/30 px-6 py-3 rounded-2xl text-xl font-extrabold shadow-md">
                {{ team.name }}
              </span>
            </div>
          </div>
          <div v-else class="text-3xl font-semibold italic text-gray-400 mt-6 leading-relaxed">
            Naozaj mi nikto neveril? Tak nikto nedostane žiadne body... 🤷‍♂️
          </div>
        </div>
      </div>

      <!-- 4. RESULTS / GUESSES CHART (STEP 2 OF TASKS) -->
      <div v-else-if="(currentSlide?.type === 'vote_individual' || currentSlide?.type === 'vote_team' || currentSlide?.type === 'special') && 
                       currentSlide?.currentStep === 2" 
           :key="'results'" 
           class="w-full max-w-6xl flex flex-col items-center">
        
        <!-- Title -->
        <h1 class="text-5xl md:text-6xl font-extrabold mb-12 text-center leading-tight font-display drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] max-w-6xl">
          {{ currentSlide?.title }}
        </h1>

        <div v-if="voteResults" class="w-full flex flex-col items-center mb-24">
          <h2 class="text-3xl font-bold mb-10 text-yellow-400 flex items-center gap-3">
            Výsledky hlasovania tímov
          </h2>
          
          <!-- Bar Chart Container -->
          <div class="flex items-end justify-center gap-8 md:gap-12 h-[420px] w-full max-w-5xl px-8 border-b border-white/20 pb-4">
            <div v-for="(result, index) in voteResults" :key="result.id" 
                 class="flex flex-col items-center justify-end w-32 relative group h-full">
              <!-- Vote count badge -->
              <span class="text-4xl font-extrabold mb-3 text-white">{{ result.count }}</span>
              
              <!-- Colored Column -->
              <div :class="['w-full rounded-t-2xl bar-grow flex items-end justify-center pb-4 shadow-lg border border-white/10', getOptionBgClass(index)]"
                   :style="{ height: `${(result.count / maxVotes) * 100 || 5}%` }">
              </div>
              
              <!-- Avatar + Name underneath -->
              <div class="mt-4 text-center absolute -bottom-24 flex flex-col items-center">
                <div class="mb-2">
                  <div v-if="isInstructorOption(result.id)" class="flex justify-center">
                    <img v-if="hasImage(getInstructorName(result.id))" 
                         :src="getInstructorImage(getInstructorName(result.id))" 
                         class="w-10 h-10 rounded-full object-cover border border-white/20 shadow-md" />
                    <div v-else class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold border border-white/20 shadow-inner">
                      {{ getInstructorName(result.id).charAt(0) }}
                    </div>
                  </div>
                  <div v-else class="flex justify-center -space-x-2">
                    <div v-for="mId in getGroupMembers(result.id)" :key="mId">
                      <img v-if="hasImage(getInstructorName(mId))" 
                           :src="getInstructorImage(getInstructorName(mId))" 
                           class="w-8 h-8 rounded-full object-cover border border-white/20 shadow-md" />
                      <div v-else class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold border border-white/20 shadow-inner">
                        {{ getInstructorName(mId).charAt(0) }}
                      </div>
                    </div>
                  </div>
                </div>
                <span class="text-xs font-bold truncate w-36 text-gray-300">{{ result.name }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { socket } from '../socket';

const state = ref(null);
const introCountdown = ref(0);
const resolveCountdown = ref(0);
let countdownInterval = null;
let resolveCountdownInterval = null;

const particles = [
  { left: '8%', delay: '0s', duration: '7s', size: '8px' },
  { left: '22%', delay: '1.5s', duration: '9s', size: '5px' },
  { left: '35%', delay: '0.5s', duration: '6s', size: '12px' },
  { left: '48%', delay: '2.5s', duration: '8s', size: '6px' },
  { left: '60%', delay: '1.2s', duration: '10s', size: '10px' },
  { left: '73%', delay: '3.0s', duration: '5s', size: '8px' },
  { left: '85%', delay: '0.8s', duration: '9s', size: '5px' },
  { left: '92%', delay: '2.0s', duration: '7s', size: '7px' }
];

onMounted(() => {
  document.title = 'Projector';
  // Register with backend
  socket.emit('client:register', { role: 'projector' });

  socket.on('connect', () => {
    socket.emit('client:register', { role: 'projector' });
  });

  socket.on('stateUpdate', (newState) => {
    state.value = newState;
  });
});

const currentSlide = computed(() => {
  if (!state.value) return null;
  return state.value.slides[state.value.currentSlideIndex];
});

watch(() => currentSlide.value?.currentStep, (newStep) => {
  const slideType = currentSlide.value?.type;

  // Regular voting countdown (step 1 for vote_individual, vote_team, special)
  if (newStep === 1 && slideType !== 'special_resolve') {
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

  // Special resolve countdown (step 1 for special_resolve)
  if (newStep === 1 && slideType === 'special_resolve') {
    if (resolveCountdownInterval) clearInterval(resolveCountdownInterval);
    resolveCountdown.value = 3;
    resolveCountdownInterval = setInterval(() => {
      if (resolveCountdown.value > 0) {
        resolveCountdown.value--;
      } else {
        clearInterval(resolveCountdownInterval);
      }
    }, 1000);
  } else if (slideType === 'special_resolve') {
    resolveCountdown.value = 0;
    if (resolveCountdownInterval) clearInterval(resolveCountdownInterval);
  }
}, { immediate: true });
const revealedInstructorRanks = ref([]);
const revealedTeamRanks = ref([]);
let revealTimeouts = [];

const getRevealDelays = (rankedList) => {
  if (!rankedList || rankedList.length === 0) return [];
  // Get distinct ranks, sorted descending (e.g. [6, 5, 4, 3, 2, 1])
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

const clearRevealTimeouts = () => {
  revealTimeouts.forEach(t => clearTimeout(t));
  revealTimeouts = [];
};

const runInstructorReveal = () => {
  clearRevealTimeouts();
  revealedInstructorRanks.value = [];
  const delaysInfo = getRevealDelays(rankedInstructors.value);
  delaysInfo.forEach(({ rank, delay }) => {
    const t = setTimeout(() => {
      revealedInstructorRanks.value.push(rank);
    }, delay);
    revealTimeouts.push(t);
  });
};

const runTeamReveal = () => {
  clearRevealTimeouts();
  revealedTeamRanks.value = [];
  const delaysInfo = getRevealDelays(rankedTeams.value);
  delaysInfo.forEach(({ rank, delay }) => {
    const t = setTimeout(() => {
      revealedTeamRanks.value.push(rank);
    }, delay);
    revealTimeouts.push(t);
  });
};

const isInstructorRevealed = (rank) => {
  return revealedInstructorRanks.value.includes(rank);
};

const isTeamRevealed = (rank) => {
  return revealedTeamRanks.value.includes(rank);
};

watch(
  [() => state.value?.currentSlideIndex, () => currentSlide.value?.currentStep],
  ([slideIdx, step]) => {
    clearRevealTimeouts();
    revealedInstructorRanks.value = [];
    revealedTeamRanks.value = [];

    if (!state.value || !currentSlide.value) return;

    const type = currentSlide.value.type;

    if (type === 'leaderboard_instructors') {
      runInstructorReveal();
    } else if (type === 'leaderboard_teams') {
      runTeamReveal();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
  if (resolveCountdownInterval) clearInterval(resolveCountdownInterval);
  clearRevealTimeouts();
});
const sortedInstructors = computed(() => {
  if (!state.value) return [];
  return [...state.value.instructors].sort((a, b) => b.score - a.score);
});

const rankedInstructors = computed(() => {
  if (!sortedInstructors.value) return [];
  let currentRank = 1;
  return sortedInstructors.value.map((ins, index) => {
    if (index > 0 && ins.score < sortedInstructors.value[index - 1].score) {
      currentRank = index + 1;
    }
    return {
      ...ins,
      rank: currentRank
    };
  });
});

const sortedTeams = computed(() => {
  if (!state.value) return [];
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

const hasInstructorTie = (rank) => {
  return rankedInstructors.value.filter(ins => ins.rank === rank).length > 1;
};

const getInstructorPodiumStyles = (ins) => {
  if (!ins) return {};
  if (ins.rank === 1) {
    return {
      cardClass: 'border-3 border-yellow-500 shadow-[0_0_30px_rgba(250,204,21,0.3)] w-56 p-5 scale-105',
      nameClass: 'text-yellow-400 text-xl font-extrabold',
      scoreClass: 'text-3xl font-black text-white',
      badgeClass: 'bg-yellow-500 text-gray-900 border-2 border-white',
      avatarBorder: 'border-3 border-yellow-500',
      avatarSize: 'w-20 h-20'
    };
  }
  if (ins.rank === 2) {
    return {
      cardClass: 'border border-slate-400/20 shadow-lg shadow-slate-900/50 w-52 p-4 scale-100',
      nameClass: 'text-white text-lg font-bold',
      scoreClass: 'text-2xl font-extrabold text-slate-300',
      badgeClass: 'bg-slate-400 text-gray-900 border border-white',
      avatarBorder: 'border-3 border-slate-400',
      avatarSize: 'w-16 h-16'
    };
  }
  return {
    cardClass: 'border border-amber-600/20 shadow-lg w-52 p-4 scale-100',
    nameClass: 'text-white text-lg font-bold',
    scoreClass: 'text-2xl font-extrabold text-amber-500',
    badgeClass: 'bg-amber-700 text-white border border-white',
    avatarBorder: 'border-3 border-amber-700',
    avatarSize: 'w-16 h-16'
  };
};

const getFinalRankStyles = (rank) => {
  if (rank === 1) {
    return {
      pedestalClass: 'w-52 h-48 bg-gradient-to-t from-yellow-950/80 to-yellow-900/30 border-t-4 border-yellow-500 rounded-t-xl rounded-b-2xl shadow-[0_0_35px_rgba(234,179,8,0.15)] flex flex-col items-center justify-end pb-5 px-3 border border-yellow-500/20 relative overflow-hidden',
      avatarClass: 'w-28 h-28 rounded-full object-cover border-4 border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.4)]',
      avatarPlaceholderClass: 'w-28 h-28 rounded-full bg-yellow-500 flex items-center justify-center text-gray-900 font-extrabold text-3xl shadow-inner border-4 border-yellow-500',
      badgeClass: 'bg-yellow-500 text-gray-900 border-2 border-white w-7 h-7 text-sm',
      nameClass: 'text-yellow-400 text-lg font-black mb-1 drop-shadow',
      scoreClass: 'text-2xl font-black text-white drop-shadow'
    };
  }
  if (rank === 2) {
    return {
      pedestalClass: 'w-48 h-36 bg-gradient-to-t from-slate-900/80 to-slate-800/40 border-t-4 border-slate-400 rounded-t-xl rounded-b-2xl shadow-2xl flex flex-col items-center justify-end pb-4 px-3 border border-white/10',
      avatarClass: 'w-24 h-24 rounded-full object-cover border-4 border-slate-400 shadow-xl',
      avatarPlaceholderClass: 'w-24 h-24 rounded-full bg-slate-400 flex items-center justify-center text-gray-900 font-extrabold text-2xl shadow-inner border-4 border-slate-400',
      badgeClass: 'bg-slate-400 text-gray-900 border border-white w-6 h-6 text-xs',
      nameClass: 'text-white text-base font-bold mb-1',
      scoreClass: 'text-xl font-black text-slate-300'
    };
  }
  return {
    pedestalClass: 'w-48 h-28 bg-gradient-to-t from-amber-950/60 to-amber-900/30 border-t-4 border-amber-700 rounded-t-xl rounded-b-2xl shadow-2xl flex flex-col items-center justify-end pb-4 px-3 border border-white/10',
    avatarClass: 'w-24 h-24 rounded-full object-cover border-4 border-amber-700 shadow-xl',
    avatarPlaceholderClass: 'w-24 h-24 rounded-full bg-amber-700 flex items-center justify-center text-white font-extrabold text-2xl shadow-inner border-4 border-amber-700',
    badgeClass: 'bg-amber-700 text-white border border-white w-6 h-6 text-xs',
    nameClass: 'text-white text-base font-bold mb-1',
    scoreClass: 'text-xl font-black text-amber-500'
  };
};

const getFinalTeamRankStyles = (rank) => {
  if (rank === 1) {
    return {
      pedestalClass: 'w-52 h-48 bg-gradient-to-t from-yellow-950/80 to-yellow-900/30 border-t-4 border-yellow-500 rounded-t-xl rounded-b-2xl shadow-[0_0_35px_rgba(234,179,8,0.15)] flex flex-col items-center justify-end pb-5 px-3 border border-yellow-500/20 relative overflow-hidden',
      badgeContainerClass: 'w-24 h-24 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center border-3 border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.4)] relative',
      badgeNumClass: 'bg-yellow-500 text-gray-900 border-2 border-white w-6 h-6 text-[11px]',
      nameClass: 'text-yellow-400 text-lg font-black mb-1 drop-shadow',
      scoreClass: 'text-2xl font-black text-white drop-shadow',
      symbol: '🏆',
      symbolSizeClass: 'text-5xl animate-pulse'
    };
  }
  if (rank === 2) {
    return {
      pedestalClass: 'w-48 h-36 bg-gradient-to-t from-slate-900/80 to-slate-800/40 border-t-4 border-slate-400 rounded-t-xl rounded-b-2xl shadow-2xl flex flex-col items-center justify-end pb-4 px-3 border border-white/10',
      badgeContainerClass: 'w-20 h-20 bg-slate-400/20 text-slate-300 rounded-full flex items-center justify-center border-3 border-slate-400 relative shadow-xl',
      badgeNumClass: 'bg-slate-400 text-gray-900 border border-white w-5 h-5 text-[10px]',
      nameClass: 'text-white text-base font-bold mb-1',
      scoreClass: 'text-xl font-black text-slate-300',
      symbol: '🥈',
      symbolSizeClass: 'text-4xl'
    };
  }
  return {
    pedestalClass: 'w-48 h-28 bg-gradient-to-t from-amber-950/60 to-amber-900/30 border-t-4 border-amber-700 rounded-t-xl rounded-b-2xl shadow-2xl flex flex-col items-center justify-end pb-4 px-3 border border-white/10',
    badgeContainerClass: 'w-20 h-20 bg-amber-700/20 text-amber-500 rounded-full flex items-center justify-center border-3 border-amber-700 relative shadow-xl',
    badgeNumClass: 'bg-amber-700 text-white border border-white w-5 h-5 text-[10px]',
    nameClass: 'text-white text-base font-bold mb-1',
    scoreClass: 'text-xl font-black text-amber-500',
    symbol: '🥉',
    symbolSizeClass: 'text-4xl'
  };
};

const votesCastCount = computed(() => {
  if (!state.value || !state.value.activeVote) return 0;
  return Object.keys(state.value.activeVote.votes).length;
});



const voteResults = computed(() => {
  if (!state.value || !state.value.activeVote || state.value.activeVote.isOpen) return null;
  const options = state.value.activeVote.options;
  const votes = Object.values(state.value.activeVote.votes);
  
  return options.map(opt => {
    const count = votes.filter(v => v === opt.id).length;
    return {
      id: opt.id,
      name: opt.name || opt.title,
      count
    };
  });
});

const maxVotes = computed(() => {
  if (!voteResults.value || voteResults.value.length === 0) return 1;
  return Math.max(...voteResults.value.map(r => r.count), 1);
});

const isInstructorOption = (optId) => {
  return optId.startsWith('ins');
};

const getCorrectTeams = (winnerId) => {
  if (!state.value || !winnerId) return [];
  const initialSlide = state.value.slides.find(s => s.type === 'special');
  if (!initialSlide || !initialSlide.votes) return [];
  return state.value.teams.filter(team => initialSlide.votes[team.id] === winnerId);
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
  if (norm === 'david') return '/David.png';
  if (norm === 'jul') return '/Jul.png';
  if (norm === 'juro') return '/Juro.png';
  if (norm === 'matus') return '/Matus.png';
  if (norm === 'danko') return '/Danko.png';
  if (norm === 'ella') return '/Ella.png';
  if (norm === 'zuzka') return '/Zuzka.png';
  return null;
};

const getTeamRankColor = (index) => {
  if (index === 0) return 'text-yellow-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]'; // 1st (Gold)
  if (index === 1) return 'text-slate-300 drop-shadow-[0_0_6px_rgba(203,213,225,0.4)]'; // 2nd (Silver)
  if (index === 2) return 'text-amber-600 drop-shadow-[0_0_6px_rgba(217,119,6,0.4)]'; // 3rd (Bronze)
  return 'text-white'; // 4th+
};

// Helper for colored columns in bar charts (unifies colors with client)
const getOptionBgClass = (index) => {
  const classes = [
    'bg-kahoot-red border-red-700 text-white shadow-red-950/30',
    'bg-kahoot-blue border-blue-700 text-white shadow-blue-950/30',
    'bg-kahoot-green border-green-800 text-white shadow-green-950/30',
    'bg-kahoot-yellow border-yellow-600 text-neutral-900 shadow-yellow-950/30',
    'bg-purple-600 border-purple-800 text-white shadow-purple-950/30',
    'bg-teal-600 border-teal-800 text-white shadow-teal-950/30'
  ];
  return classes[index % classes.length];
};


</script>

<style scoped>
.countdown-number {
  animation: pulseScale 1s infinite ease-out;
}

.gold-particle {
  position: absolute;
  bottom: -20px;
  background: radial-gradient(circle, rgba(234,179,8,0.7) 0%, rgba(234,179,8,0) 70%);
  border-radius: 50%;
  pointer-events: none;
  animation: floatUp 8s infinite linear;
  filter: blur(1px);
}

@keyframes floatUp {
  0% {
    transform: translateY(0) translateX(0) scale(0.5);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-110vh) translateX(50px) scale(1.3);
    opacity: 0;
  }
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
</style>
