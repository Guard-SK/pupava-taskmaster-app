const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const dataDir = path.join(__dirname, 'data');
const stateFile = path.join(dataDir, 'state.json');

// Ensure data dir exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initial default state
const defaultState = {
  instructors: [
    { id: "ins1", name: "Dávid", score: 0 },
    { id: "ins2", name: "Ella", score: 0 },
    { id: "ins3", name: "Zuzka", score: 0 },
    { id: "ins4", name: "Matúš", score: 0 },
    { id: "ins5", name: "Jul", score: 0 },
    { id: "ins6", name: "Juro", score: 0 }
  ],
  teams: [
    { id: "team1", name: "Tím 1", score: 0 },
    { id: "team2", name: "Tím 2", score: 0 },
    { id: "team3", name: "Tím 3", score: 0 },
    { id: "team4", name: "Tím 4", score: 0 },
    { id: "team5", name: "Tím 5", score: 0 },
    { id: "team6", name: "Tím 6", score: 0 }
  ],
  slides: [
    { id: "slide1", type: "special", title: "Kto vyhrá dnešnú šou?", votes: {}, pointsAwarded: false, winnerInstructorId: null, currentStep: 1 },
    { id: "slide2", type: "blank" },
    { id: "slide3", type: "vote_individual", title: "Kto postavil najvyššiu vežu?", votes: {}, pointsAwarded: false, rankings: [], currentStep: 0 },
    { id: "slide4", type: "leaderboard" },
    { id: "slide_special_resolve", type: "special_resolve", title: "Vyhodnotenie tipovačky", votes: {}, pointsAwarded: false, winnerInstructorId: null, currentStep: 0 }
  ],
  currentSlideIndex: 0,
  activeVote: null,
  history: []
};

// Load state or create if not exists
let state;
try {
  if (fs.existsSync(stateFile)) {
    const rawData = fs.readFileSync(stateFile, 'utf8');
    state = JSON.parse(rawData);
    // Sanitize state to ensure correct schema
    if (!state.history) state.history = [];
    if (!state.instructors || state.instructors.length === 0) state.instructors = defaultState.instructors;
    if (!state.teams || state.teams.length === 0) state.teams = defaultState.teams;
    if (!state.slides || state.slides.length === 0) state.slides = defaultState.slides;
    if (state.slides && !state.slides.some(s => s.type === 'special_resolve')) {
      state.slides.push({
        id: "slide_special_resolve",
        type: "special_resolve",
        title: "Vyhodnotenie tipovačky",
        votes: {},
        pointsAwarded: false,
        winnerInstructorId: null,
        currentStep: 0
      });
    }
    if (state.currentSlideIndex === undefined) state.currentSlideIndex = 0;
    // Clear activeVote on server restart to keep things consistent
    state.activeVote = null;
    state.isFrozen = false;
  } else {
    state = defaultState;
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  }
} catch (err) {
  console.error("Error loading state.json, falling back to default.", err);
  state = defaultState;
}

const saveState = () => {
  try {
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Error saving state.json", err);
  }
};

// Track active connections
const activeSockets = new Map(); // socket.id -> { role, teamId }

const getConnectedClients = () => {
  const status = {
    admin: false,
    projector: false,
    teams: {}
  };
  state.teams.forEach(t => {
    status.teams[t.id] = false;
  });
  for (const info of activeSockets.values()) {
    if (info.role === 'admin') status.admin = true;
    if (info.role === 'projector') status.projector = true;
    if (info.role === 'client' && info.teamId) {
      status.teams[info.teamId] = true;
    }
  }
  return status;
};

const broadcastState = () => {
  const connectedClients = getConnectedClients();
  const adminState = { ...state, connectedClients };
  
  let clientState = { ...state, connectedClients };
  if (state.isFrozen) {
    clientState.currentSlideIndex = state.frozenSlideIndex;
    if (state.frozenSlideStep !== undefined && clientState.slides && clientState.slides[state.frozenSlideIndex]) {
      clientState.slides = clientState.slides.map((s, idx) => {
        if (idx === state.frozenSlideIndex) {
          return { ...s, currentStep: state.frozenSlideStep };
        }
        return s;
      });
    }
    if (state.activeVote && state.activeVote.slideId !== state.slides[state.frozenSlideIndex]?.id) {
      clientState.activeVote = null;
    }
  }

  io.to('admins').emit('stateUpdate', adminState);
  io.except('admins').emit('stateUpdate', clientState);
};

const closeActiveVote = () => {
  if (state.activeVote && state.activeVote.isOpen) {
    state.activeVote.isOpen = false;
    const currentSlide = state.slides.find(s => s.id === state.activeVote.slideId);
    if (currentSlide) {
      currentSlide.currentStep = 2;
    }
    saveState();
    broadcastState();
  }
};

// Express static serving (serve built Vue app in production)
app.use(express.static(path.join(__dirname, 'client/dist')));

// Fallback for SPA routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.url.startsWith('/socket.io') && !req.url.includes('.')) {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  } else {
    next();
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current state immediately on connection
  broadcastState();

  // Register client role
  socket.on('client:register', ({ role, teamId }) => {
    socket.leave('admins');
    activeSockets.set(socket.id, { role, teamId });
    console.log(`Registered socket ${socket.id} as ${role}${teamId ? ` (team: ${teamId})` : ''}`);
    if (role === 'admin') {
      socket.join('admins');
    }
    broadcastState();
  });

  // Admin: update full state (from Builder)
  socket.on('admin:updateState', (newState) => {
    // Keep slides, currentSlideIndex, teams, instructors
    if (newState.slides) state.slides = newState.slides;
    if (newState.teams) state.teams = newState.teams;
    if (newState.instructors) state.instructors = newState.instructors;
    if (newState.currentSlideIndex !== undefined) state.currentSlideIndex = newState.currentSlideIndex;

    // Ensure each slide has a votes object
    state.slides.forEach(slide => {
      if (!slide.votes) slide.votes = {};
    });

    saveState();
    broadcastState();
  });

  // Admin: Change slide
  socket.on('admin:changeSlide', (index) => {
    if (index >= 0 && index < state.slides.length) {
      state.currentSlideIndex = index;
      const slide = state.slides[index];
      if (slide && (slide.type === 'vote_individual' || slide.type === 'vote_team')) {
        slide.currentStep = 0;
      } else if (slide && slide.type === 'special') {
        slide.currentStep = 1; // Starts directly with voting!
      } else if (slide && slide.type === 'special_resolve') {
        slide.currentStep = 0; // Starts with blank / selection
      }
      saveState();
      broadcastState();
    }
  });

  // Admin: Toggle Freeze
  socket.on('admin:toggleFreeze', () => {
    state.isFrozen = !state.isFrozen;
    if (state.isFrozen) {
      state.frozenSlideIndex = state.currentSlideIndex;
      state.frozenSlideStep = state.slides[state.currentSlideIndex]?.currentStep;
    } else {
      delete state.frozenSlideIndex;
      delete state.frozenSlideStep;
    }
    broadcastState();
  });

  // Admin: Set slide step (guided flow)
  socket.on('admin:setSlideStep', ({ slideIndex, step }) => {
    if (slideIndex >= 0 && slideIndex < state.slides.length) {
      const slide = state.slides[slideIndex];
      slide.currentStep = step;

      // Step 1: Start voting automatically (for vote slides only, not special_resolve)
      if (step === 1 && slide.type !== 'special_resolve') {
        slide.votes = {};
        slide.pointsAwarded = false;
        slide.rankings = [];
        slide.winnerInstructorId = null;

        let options = [];
        if (slide.type === 'vote_individual' || slide.type === 'special') {
          options = state.instructors.map(i => ({ id: i.id, name: i.name }));
        } else if (slide.type === 'vote_team') {
          options = (slide.teamGroups || []).map(g => ({ id: g.id, name: g.name }));
        }

        state.activeVote = {
          isOpen: true,
          slideId: slide.id,
          options: options,
          votes: {},
          startedAt: Date.now()
        };
      }

      // Step 2: Close voting automatically
      if (step === 2) {
        if (state.activeVote && state.activeVote.isOpen) {
          state.activeVote.isOpen = false;
        }
      }

      // Step 4: Auto-execute points award
      if (step === 4 && !slide.pointsAwarded) {
        let awardDetails = [];
        if (slide.type === 'vote_individual' && slide.rankings && slide.rankings.length > 0) {
          const pointsMap = [600, 500, 400, 300, 200, 100];
          slide.rankings.forEach((insId, idx) => {
            const points = pointsMap[idx] || 0;
            const instructor = state.instructors.find(i => i.id === insId);
            if (instructor) {
              instructor.score += points;
              awardDetails.push({ name: instructor.name, points, type: 'instructor' });
            }

            Object.entries(slide.votes || {}).forEach(([teamId, votedId]) => {
              if (votedId === insId) {
                const team = state.teams.find(t => t.id === teamId);
                if (team) {
                  team.score += points;
                  awardDetails.push({ name: team.name, points, type: 'team' });
                }
              }
            });
          });
          slide.pointsAwarded = true;
        } else if (slide.type === 'vote_team' && slide.rankings && slide.rankings.length > 0) {
          const is3x2 = slide.teamFormat === '3x2';
          const pointsMap = is3x2 ? [600, 400, 200] : [600, 300];
          slide.rankings.forEach((groupId, idx) => {
            const points = pointsMap[idx] || 0;
            const group = slide.teamGroups.find(g => g.id === groupId);
            if (group) {
              group.members.forEach(memberId => {
                const instructor = state.instructors.find(i => i.id === memberId);
                if (instructor) {
                  instructor.score += points;
                  awardDetails.push({ name: instructor.name, points, type: 'instructor' });
                }
              });

              Object.entries(slide.votes || {}).forEach(([teamId, votedGroupId]) => {
                if (votedGroupId === groupId) {
                  const team = state.teams.find(t => t.id === teamId);
                  if (team) {
                    team.score += points;
                    awardDetails.push({ name: team.name, points, type: 'team' });
                  }
                }
              });
            }
          });
          slide.pointsAwarded = true;
        }

        // Log history
        if (awardDetails.length > 0) {
          state.history = state.history || [];
          state.history.push({
            id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            timestamp: Date.now(),
            type: 'task',
            slideTitle: slide.title || 'Úloha',
            slideId: slide.id,
            details: awardDetails
          });
        }
      }

      saveState();
      broadcastState();
    }
  });

  // Admin: Update rankings in real-time (during Step 3)
  socket.on('admin:updateRankings', ({ slideId, rankings }) => {
    const slide = state.slides.find(s => s.id === slideId);
    if (slide && !slide.pointsAwarded) {
      slide.rankings = rankings;
      saveState();
      broadcastState();
    }
  });

  // Admin: Start vote
  socket.on('admin:startVote', (options) => {
    const currentSlide = state.slides[state.currentSlideIndex];
    if (!currentSlide) return;

    // Reset slide's votes on starting a new vote
    currentSlide.votes = {};
    currentSlide.pointsAwarded = false;
    currentSlide.rankings = [];
    currentSlide.winnerInstructorId = null;

    state.activeVote = {
      isOpen: true,
      slideId: currentSlide.id,
      options: options, // e.g. [{id: 'ins1', name: 'Inštruktor Aďo'}, ...]
      votes: {}, // maps teamId -> optionId
      startedAt: Date.now()
    };

    saveState();
    broadcastState();
  });

  // Admin: Close vote early
  socket.on('admin:closeVote', () => {
    closeActiveVote();
  });

  // Admin: Reset vote
  socket.on('admin:resetVote', () => {
    state.activeVote = null;
    const currentSlide = state.slides[state.currentSlideIndex];
    if (currentSlide) {
      currentSlide.votes = {};
      currentSlide.pointsAwarded = false;
      currentSlide.rankings = [];
      currentSlide.winnerInstructorId = null;
    }
    saveState();
    broadcastState();
  });

  // Admin: Award points for a slide
  socket.on('admin:awardPoints', ({ slideId, rankings }) => {
    const slide = state.slides.find(s => s.id === slideId);
    if (!slide || slide.pointsAwarded) return;

    if (slide.type === 'vote_individual') {
      // rankings is an ordered array of instructor IDs (1st to 6th)
      const pointsMap = [600, 500, 400, 300, 200, 100];

      rankings.forEach((insId, idx) => {
        const points = pointsMap[idx] || 0;
        // Award to instructor
        const instructor = state.instructors.find(i => i.id === insId);
        if (instructor) instructor.score += points;

        // Award to teams who voted for this instructor
        Object.entries(slide.votes || {}).forEach(([teamId, votedId]) => {
          if (votedId === insId) {
            const team = state.teams.find(t => t.id === teamId);
            if (team) team.score += points;
          }
        });
      });

      slide.rankings = rankings;
      slide.pointsAwarded = true;

    } else if (slide.type === 'vote_team') {
      // rankings is an ordered array of group IDs (e.g. g1, g2, g3)
      const is3x2 = slide.teamFormat === '3x2';
      const pointsMap = is3x2 ? [600, 400, 200] : [600, 300];

      rankings.forEach((groupId, idx) => {
        const points = pointsMap[idx] || 0;
        const group = slide.teamGroups.find(g => g.id === groupId);
        if (!group) return;

        // Award to instructors in this group
        group.members.forEach(member => {
          const instructor = state.instructors.find(i => i.id === member.id || i.id === member);
          if (instructor) instructor.score += points;
        });

        // Award to kids teams who voted for this group
        Object.entries(slide.votes || {}).forEach(([teamId, votedGroupId]) => {
          if (votedGroupId === groupId) {
            const team = state.teams.find(t => t.id === teamId);
            if (team) team.score += points;
          }
        });
      });

      slide.rankings = rankings;
      slide.pointsAwarded = true;
    }

    saveState();
    broadcastState();
  });

  // Admin: Resolve special question ("Kto vyhrá dnešnú šou?")
  socket.on('admin:resolveSpecialQuestion', ({ slideId, winnerInstructorId }) => {
    const slide = state.slides.find(s => s.id === slideId);
    if (!slide) return;

    // Always advance to step 2 and set winner (even if points already awarded)
    slide.winnerInstructorId = winnerInstructorId;
    slide.currentStep = 2;

    // Only award points once
    if (!slide.pointsAwarded) {
      slide.pointsAwarded = true;

      let awardDetails = [];

      // Only kids teams who guessed correctly get 600 points (instructor does NOT get points)
      const initialSlide = state.slides.find(s => s.type === 'special');
      if (initialSlide && initialSlide.votes) {
        Object.entries(initialSlide.votes).forEach(([teamId, votedInstructorId]) => {
          if (votedInstructorId === winnerInstructorId) {
            const team = state.teams.find(t => t.id === teamId);
            if (team) {
              team.score += 600;
              awardDetails.push({ name: team.name, points: 600, type: 'team' });
            }
          }
        });
      }

      // Log history
      if (awardDetails.length > 0) {
        state.history = state.history || [];
        state.history.push({
          id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          timestamp: Date.now(),
          type: 'task',
          slideTitle: slide.title || 'Vyhodnotenie tipovačky',
          slideId: slide.id,
          details: awardDetails
        });
      }
    }

    saveState();
    broadcastState();
  });

  // Admin: Start special resolve sequence (atomically save winner + set step 1)
  socket.on('admin:startSpecialResolve', ({ slideId, slideIndex, winnerInstructorId }) => {
    const slide = state.slides.find(s => s.id === slideId);
    if (!slide) return;

    // Save winner, reset awarded flag, set step to 1 (countdown phase)
    slide.winnerInstructorId = winnerInstructorId;
    slide.currentStep = 1;
    slide.pointsAwarded = false; // Reset so resolveSpecialQuestion can award again

    saveState();
    broadcastState();
  });

  // Admin: Reset points for a single slide (retract scores)
  socket.on('admin:resetSlidePoints', ({ slideId }) => {
    const slide = state.slides.find(s => s.id === slideId);
    if (!slide || !slide.pointsAwarded) return;

    if (slide.type === 'vote_individual') {
      const pointsMap = [600, 500, 400, 300, 200, 100];
      const rankings = slide.rankings || [];

      rankings.forEach((insId, idx) => {
        const points = pointsMap[idx] || 0;

        // Subtract from instructor
        const instructor = state.instructors.find(i => i.id === insId);
        if (instructor) instructor.score = Math.max(0, instructor.score - points);

        // Subtract from teams
        Object.entries(slide.votes || {}).forEach(([teamId, votedId]) => {
          if (votedId === insId) {
            const team = state.teams.find(t => t.id === teamId);
            if (team) team.score = Math.max(0, team.score - points);
          }
        });
      });

      slide.rankings = [];
      slide.pointsAwarded = false;
      slide.currentStep = 3;

    } else if (slide.type === 'vote_team') {
      const is3x2 = slide.teamFormat === '3x2';
      const pointsMap = is3x2 ? [600, 400, 200] : [600, 300];
      const rankings = slide.rankings || [];

      rankings.forEach((groupId, idx) => {
        const points = pointsMap[idx] || 0;
        const group = slide.teamGroups.find(g => g.id === groupId);
        if (!group) return;

        // Subtract from instructors
        group.members.forEach(member => {
          const instructor = state.instructors.find(i => i.id === member.id || i.id === member);
          if (instructor) instructor.score = Math.max(0, instructor.score - points);
        });

        // Subtract from teams
        Object.entries(slide.votes || {}).forEach(([teamId, votedGroupId]) => {
          if (votedGroupId === groupId) {
            const team = state.teams.find(t => t.id === teamId);
            if (team) team.score = Math.max(0, team.score - points);
          }
        });
      });

      slide.rankings = [];
      slide.pointsAwarded = false;
      slide.currentStep = 3;

    } else if (slide.type === 'special_resolve') {
      const winnerId = slide.winnerInstructorId;
      if (winnerId) {
        // Subtract from instructor
        const instructor = state.instructors.find(i => i.id === winnerId);
        if (instructor) instructor.score = Math.max(0, instructor.score - 600);

        // Subtract from teams based on the initial special slide's votes
        const initialSlide = state.slides.find(s => s.type === 'special');
        if (initialSlide && initialSlide.votes) {
          Object.entries(initialSlide.votes).forEach(([teamId, votedId]) => {
            if (votedId === winnerId) {
              const team = state.teams.find(t => t.id === teamId);
              if (team) team.score = Math.max(0, team.score - 600);
            }
          });
        }
      }

      slide.winnerInstructorId = null;
      slide.pointsAwarded = false;
      slide.currentStep = 0;
    }

    // Clear slide history
    if (state.history) {
      state.history = state.history.filter(h => h.slideId !== slideId);
    }

    saveState();
    broadcastState();
  });

  // Admin: Update scores (manual correction)
  socket.on('admin:updateScores', ({ type, updates }) => {
    if (type === 'instructors') {
      Object.entries(updates).forEach(([id, amount]) => {
        const ins = state.instructors.find(i => i.id === id);
        if (ins) {
          ins.score = Math.max(0, ins.score + amount);
          state.history = state.history || [];
          state.history.push({
            id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            timestamp: Date.now(),
            type: 'manual',
            recipient: ins.name,
            recipientType: 'instructor',
            delta: amount > 0 ? `+${amount} b` : `${amount} b`
          });
        }
      });
    } else if (type === 'teams') {
      Object.entries(updates).forEach(([id, amount]) => {
        const team = state.teams.find(t => t.id === id);
        if (team) {
          team.score = Math.max(0, team.score + amount);
          state.history = state.history || [];
          state.history.push({
            id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            timestamp: Date.now(),
            type: 'manual',
            recipient: team.name,
            recipientType: 'team',
            delta: amount > 0 ? `+${amount} b` : `${amount} b`
          });
        }
      });
    }
    saveState();
    broadcastState();
  });

  // Admin: Clear history
  socket.on('admin:clearHistory', () => {
    state.history = [];
    saveState();
    broadcastState();
  });

  // Admin: Reset all scores and reset presentation
  socket.on('admin:resetAllScores', () => {
    state.instructors.forEach(ins => ins.score = 0);
    state.teams.forEach(team => team.score = 0);
    state.history = []; // Clear history on reset all
    state.slides.forEach(slide => {
      slide.votes = {};
      slide.pointsAwarded = false;
      slide.rankings = [];
      slide.winnerInstructorId = null;
    });
    state.currentSlideIndex = 0;
    state.activeVote = null;
    saveState();
    broadcastState();
  });

  // Client: Submit vote
  socket.on('client:vote', ({ teamId, optionId }) => {
    if (state.activeVote && state.activeVote.isOpen) {
      state.activeVote.votes[teamId] = optionId;

      // Update slide votes as well for persistence
      const currentSlide = state.slides.find(s => s.id === state.activeVote.slideId);
      if (currentSlide) {
        if (!currentSlide.votes) currentSlide.votes = {};
        currentSlide.votes[teamId] = optionId;
      }

      saveState();
      broadcastState();

      // Check if all 6 teams have voted
      const votesCount = Object.keys(state.activeVote.votes).length;
      if (votesCount >= state.teams.length) {
        closeActiveVote();
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    activeSockets.delete(socket.id);
    broadcastState();
  });
});

// Serve client built static assets in production
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get(/^(.*)$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
