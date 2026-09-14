import R from "./ramda.js";
import Imperium from "./Imperium.js";

// ------------------Tile images----------------------------
const Tile_Images = {
    "1": "Tiles/Student_Finance.svg",
    "2": "Tiles/Huxley.svg",
    "3": "Tiles/Bills_Due.svg",
    "4": "Tiles/Westbound_Station.svg",
    "5": "Tiles/Blackett.svg",
    "6": "Tiles/Event_Card1.svg",
    "7": "Tiles/Roderic_Hill.svg",
    "8": "Tiles/Gap_Year.svg",
    "9": "Tiles/Science_Museum.svg",
    "10": "Tiles/Sir_Alexander_Fleming.svg",
    "11": "Tiles/Business_School.svg",
    "12": "Tiles/Event_Card2.svg",
    "13": "Tiles/Acex_Workshop.svg",
    "14": "Tiles/Dyson_Building.svg",
    "15": "Tiles/Student_Union.svg",
    "16": "Tiles/Sherfield_Walkway.svg",
    "17": "Tiles/Event_Card3.svg",
    "18": "Tiles/Abdus_Salam_Library.svg",
    "19": "Tiles/Eastbound_Station.svg",
    "20": "Tiles/Hammersmith.svg",
    "21": "Tiles/Charing_Cross_Hospital.svg",
    "22": "Tiles/Failed.svg",
    "23": "Tiles/White_city.svg",
    "24": "Tiles/History_Museum.svg",
    "25": "Tiles/Queens_Tower.svg",
    "26": "Tiles/Event_Card4.svg",
    "27": "Tiles/Rent_Due.svg",
    "28": "Tiles/Royal_Albert_Hall.svg"
};
const Tile_Info = {
    "2": "Tile_Info/HuxleyRent.svg",
    "4": "Tile_Info/WestboundRent.svg",
    "5": "Tile_Info/BlackettRent.svg",
    "7": "Tile_Info/RodericRent.svg",
    "9": "Tile_Info/ScienceRent.svg",
    "10": "Tile_Info/FlemmingRent.svg",
    "11": "Tile_Info/BusinessRent.svg",
    "13": "Tile_Info/AcexRent.svg",
    "14": "Tile_Info/DysonRent.svg",
    "16": "Tile_Info/SherfieldRent.svg",
    "18": "Tile_Info/AbdusRent.svg",
    "19": "Tile_Info/EastboundRent.svg",
    "20": "Tile_Info/HammersmithRent.svg",
    "21": "Tile_Info/CharingRent.svg",
    "23": "Tile_Info/WhiteRent.svg",
    "24": "Tile_Info/HistoryRent.svg",
    "25": "Tile_Info/QueensRent.svg",
    "28": "Tile_Info/RoyalRent.svg"
};

/** Human-readable names for upgrade levels. */
const Degree_Names = {
    "1": "Bachelor's Degree",
    "2": "Master's Degree",
    "3": "PhD"
};


// ------------------State-------------------------------------
let gameState = undefined;
let selectedIcons = {}; // Maps player index to their chosen emoji

// ── UI Helpers ──────────────────────────────────────────────

/**
 * shortening element function
 */
const getEl = (id) => document.getElementById(id);

/**
 * Filter function to get only players who haven't gone bankrupt.
 */
const getActivePlayers = R.filter(R.pipe(R.prop("isBankrupt"), R.not));

// ------------------Setup Screen---------------------

/**
 * Initialises the main home screen where players select how many are playing,
 * their names, and their icons.
 */
const initHomeScreen = function () {
    const grid = getEl("player-count-grid");
    const label = getEl("home-selected-label");
    const namesContainer = getEl("home-names");
    const startBtn = getEl("home-start-btn");
    const hint = getEl("home-money-hint");

    // Display how much money everyone starts with
    hint.innerHTML = (
        "Each player starts with <strong>£" +
        Imperium.starting_money.toLocaleString() +
        "</strong>"
    );

    let playerCount = 0;

    // Create buttons for 2, 3, or 4 players
    const createPlayerCountButtons = R.forEach(function (n) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "count-btn";
        btn.textContent = n;

        btn.addEventListener("click", function () {
            // Highlight the clicked button
            grid.querySelectorAll(".count-btn").forEach(
                (b) => b.classList.remove("active")
            );
            btn.classList.add("active");

            // Update UI to show the setup fields for 'n' players
            playerCount = n;
            label.textContent = `${n} players selected`;
            selectedIcons = {};
            buildPlayerSetups(n, namesContainer);
            validateHome(namesContainer, startBtn);
        });

        grid.appendChild(btn);
    });

    createPlayerCountButtons([2, 3, 4]);

    // Handle clicking the big "Start Game" button
    startBtn.addEventListener("click", function () {
        if (playerCount < 2) {
            return;
        }

        // Build the player objects based on what was typed/selected
        const createSetupPlayer = function (i) {
            const input = getEl(`player-name-${i}`);
            const name = (input && input.value.trim()) || `Player ${i + 1}`;
            const emoji = selectedIcons[i] || Imperium.icon_choices[i].emoji;
            const colour = Imperium.token_colours[
                i % Imperium.token_colours.length
            ];
            return Imperium.create_player(i + 1, name, emoji, colour);
        };

        const players = R.times(createSetupPlayer, playerCount);
        launchGame(players);
    });
};

/**
 * Builds the name input and icon picker for each player.
 */
const buildPlayerSetups = function (n, container) {
    container.innerHTML = "";

    R.times(function (i) {
        const colour = Imperium.token_colours[
            i % Imperium.token_colours.length
        ];

        const setupDiv = document.createElement("div");
        setupDiv.className = "home-player-setup";

        // Player Header (e.g. "Player 1")
        const header = document.createElement("div");
        header.className = "home-player-header";
        const dot = document.createElement("div");
        dot.className = "player-colour-dot";
        dot.style.backgroundColor = colour;
        const lbl = document.createElement("span");
        lbl.className = "home-player-label";
        lbl.textContent = `Player ${i + 1}`;
        header.append(dot, lbl);

        // Name Input
        const input = document.createElement("input");
        input.type = "text";
        input.className = "home-name-input";
        input.placeholder = `Player ${i + 1}`;
        input.maxLength = 20;
        input.id = `player-name-${i}`;
        input.addEventListener("input", () => validateHome(
            container,
            getEl("home-start-btn")
        ));

        // Icon Picker
        const iconLabel = document.createElement("div");
        iconLabel.className = "icon-picker-label";
        iconLabel.textContent = "Choose your icon";

        const picker = document.createElement("div");
        picker.className = "icon-picker";
        picker.id = `icon-picker-${i}`;

        R.forEach(function ({ emoji }) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "icon-btn";
            btn.textContent = emoji;
            btn.dataset.emoji = emoji;

            btn.addEventListener("click", function () {
                selectedIcons[i] = emoji;
                refreshIconPickers(n);
                validateHome(container, getEl("home-start-btn"));
            });

            picker.appendChild(btn);
        }, Imperium.icon_choices);

        setupDiv.append(header, input, iconLabel, picker);
        container.appendChild(setupDiv);
    }, n);

    refreshIconPickers(n);
};

/**
 * Updates the icon pickers so you can't choose an emoji
    someone else already picked.
 */
const refreshIconPickers = function (n) {
    const takenEmojis = R.values(selectedIcons);

    R.times(function (i) {
        const picker = getEl(`icon-picker-${i}`);
        if (!picker) {
            return;
        }

        picker.querySelectorAll(".icon-btn").forEach(function (btn) {
            const emoji = btn.dataset.emoji;
            btn.classList.remove("selected", "taken");

            if (selectedIcons[i] === emoji) {
                btn.classList.add("selected");
            } else if (R.includes(emoji, takenEmojis) &&
                selectedIcons[i] !== emoji) {
                btn.classList.add("taken");
            }
        });
    }, n);
};

/**
 * Enables or disables the Start button depending on if everyone is ready.
 */
const validateHome = function (container, btn) {
    const inputs = container.querySelectorAll(".home-name-input");
    const allHaveIcons = Object.keys(selectedIcons).length === inputs.length;
    btn.disabled = inputs.length === 0 || !allHaveIcons;
};


// ------------------Game Launch---------------------

/**
 * Transitions from the setup screen to the actual game board.
 * @param {Imperium.Player[]} players
 */
const launchGame = function (players) {
    // 1. Create the engine state
    gameState = Imperium.create_game_state(players);

    // 2. Swap screens
    getEl("home-screen").classList.add("hidden");
    getEl("game-screen").classList.remove("hidden");

    // 3. Render the board and UI
    loadTileImages();
    renderPlayerPanel();
    renderTokensOnBoard();
    renderOwnerIcons();
    renderUpgradeIndicators();
    updateActionButtons();
    attachTileClickHandlers();

    console.log("Game started!", gameState);
};


// ------------------Board Rendering---------------------

/**
 * Loads the background images onto the game board tiles.
 * @returns {void}
 */
const loadTileImages = function () {
    R.forEach(function ([id, imgPath]) {
        const el = getEl(`tile-${id}`);
        if (el && imgPath) {
            el.style.backgroundImage = `url('./assets/${imgPath}')`;
        }
    }, R.toPairs(Tile_Images));
};

/**
 * Makes every tile clickable so players can inspect property cards.
 */
const attachTileClickHandlers = function () {
    R.times(function (i) {
        const tileId = i + 1;
        const el = getEl(`tile-${tileId}`);
        const tileData = Imperium.get_tile_data(tileId);
        if (el && tileData && tileData.type === "property") {
            el.classList.add("interactable-tile");
            el.addEventListener("click", function () {
                showPropertyInfo(tileId);
            });
        }
    }, Imperium.total_tiles);
};


// Dynamic Board Elements (Tokens, Icons, Houses)

/**
 * Draws the player emojis on whatever tile they are currently standing on.
 * Grouping players by tile to prevent overlap,
 * and styling visitors in the Gap Year differently.
 * @returns {void}
 */
const renderTokensOnBoard = function () {
    // Clear old tokens
    document.querySelectorAll(".tile-tokens").forEach(function (el) {
        el.remove();
    });
    if (!gameState) {
        return;
    }

    // Group active players by which tile position they are on
    const activePlayers = getActivePlayers(gameState.players);
    const playersByTile = R.groupBy(R.prop("position"), activePlayers);

    // Render each group of players onto their tile
    R.forEachObjIndexed(function (playersOnTile, tileId) {
        const tileEl = getEl(`tile-${tileId}`);
        if (!tileEl) {
            return;
        }

        const container = document.createElement("div");

        // Special case: make tokens look different if
        // they are just visiting the Gap Year tile
        const isVisitingGapYear = Number(tileId) === Imperium.gap_year_tile &&
            R.all(R.pipe(R.prop("inGapYear"), R.not), playersOnTile);

        container.className = "tile-tokens" + (
            isVisitingGapYear ? " tile-tokens--visiting" : "");

        // Add each player's emoji token
        R.forEach(function (player) {
            const token = document.createElement("div");
            token.className = "tile-token";
            token.style.backgroundColor = player.colour;
            token.title = player.name;
            token.textContent = player.emoji;
            container.appendChild(token);
        }, playersOnTile);

        tileEl.appendChild(container);
    }, playersByTile);
};

/**
 * Draws a small coloured badge on tiles to show who owns them.
 */
const renderOwnerIcons = function () {
    document.querySelectorAll(".tile-owner-icon").forEach(function (el) {
        el.remove();
    });
    if (!gameState) {
        return;
    }

    const activePlayers = getActivePlayers(gameState.players);

    R.forEach(function (player) {
        R.forEach(function (tileId) {
            const tileEl = getEl(`tile-${tileId}`);
            if (!tileEl) {
                return;
            }

            const icon = document.createElement("div");
            icon.className = "tile-owner-icon";
            icon.style.backgroundColor = player.colour;
            icon.textContent = player.emoji;
            tileEl.appendChild(icon);
        }, player.properties);
    }, activePlayers);
};

/**
 * Draws scroll icons (levels 1–2)S
 * or a certificate icon (level 3) on upgraded properties.
 */
const renderUpgradeIndicators = function () {
    document.querySelectorAll(".tile-upgrade-indicator").forEach(
        function (el) {
            el.remove();
        });
    if (!gameState) {
        return;
    }

    R.forEachObjIndexed(function (level, tileId) {
        if (level <= 0) {
            return;
        }

        const tileEl = getEl(`tile-${tileId}`);
        if (!tileEl) {
            return;
        }

        const indicator = document.createElement("div");
        indicator.className = "tile-upgrade-indicator";
        indicator.style.fontSize = "16px";
        indicator.style.lineHeight = "1";

        if (level === 3) {
            indicator.innerHTML = "🎓";
        } else {
            indicator.innerHTML = "📜".repeat(level);
        }
        tileEl.appendChild(indicator);
    }, gameState.propertyLevels);
};


// Side Panel (Player Stats)


/**
 * Updates the side panel that lists all players, their money,
    and their properties.
 */
const renderPlayerPanel = function () {
    if (!gameState) {
        return;
    }

    const panelPlayers = getEl("panel-players");
    const panelRound = getEl("panel-round");

    panelRound.textContent = `Round ${gameState.round}`;
    panelPlayers.innerHTML = "";

    const forEachIndexed = R.addIndex(R.forEach);

    forEachIndexed(function (player, index) {
        const isTheirTurn = index === gameState.currentPlayerIndex;

        const card = document.createElement("div");

        const activeClass = (isTheirTurn ? " active" : "");
        const bankruptClass = (
            player.isBankrupt ?
                " bankrupt" :
                ""
        );

        card.className = "player-card" + activeClass + bankruptClass;

        card.id = "player-card-" + player.id;

        card.style.setProperty("--player-colour", player.colour);
        // Header: Emoji, Name, and "Your Turn" badge
        const header = document.createElement("div");
        header.className = "pc-header";
        header.innerHTML = `
            <div class="pc-avatar">${player.emoji}</div>
            <div class="pc-name">${player.name}</div>
            <div class="pc-turn-badge">Your Turn</div>
        `;

        // Money Display
        const money = document.createElement("div");
        money.className = "pc-money";
        if (player.money < 0) {
            money.classList.add("pc-money--negative");
            money.textContent = `-£${Math.abs(player.money).toLocaleString()}`;
        } else {
            money.textContent = `£${player.money.toLocaleString()}`;
        }

        const divider = document.createElement("div");
        divider.className = "pc-divider";

        // Properties List
        const propsTitle = document.createElement("div");
        propsTitle.className = "pc-props-title";
        propsTitle.textContent = "Properties";

        const propsList = document.createElement("div");
        propsList.className = "pc-props-list";

        if (player.properties.length === 0) {
            propsList.innerHTML =
                `<span class="pc-props-empty">None yet</span>`;
        } else {
            // Render a chip for each property they own
            player.properties.forEach(function (tileId) {
                const data = Imperium.get_tile_data(tileId);
                const chip = document.createElement("div");
                chip.className = "prop-chip";
                chip.addEventListener("click", () => showPropertyInfo(tileId));

                const group = (
                    (data && data.colourGroup)
                        ? Imperium.get_colour_group(data.colourGroup)
                        : undefined
                );

                const dotColor = (
                    group
                        ? group.colour
                        : "var(--accent)"
                );

                const name = (
                    data
                        ? data.name
                        : ("Tile " + tileId)
                );

                chip.innerHTML =
                    "<div class=\"prop-chip-dot\" style=\"background: " +
                    dotColor +
                    "\"></div>" +
                    "<span>" +
                    name +
                    "</span>";

                // Add a level badge if they've upgraded it
                const upgradeLevel = gameState.propertyLevels[tileId] || 0;
                if (upgradeLevel > 0) {
                    const degreeLabel = (
                        Degree_Names[upgradeLevel] || `Level ${upgradeLevel}`
                    );
                    chip.innerHTML += (
                        `<div class="prop-chip-level">${degreeLabel}</div>`
                    );
                }

                propsList.appendChild(chip);
            });
        }

        card.append(header, money, divider, propsTitle, propsList);
        panelPlayers.appendChild(card);
    }, gameState.players);
};

// ============================================================
// Action Buttons Logic
// ============================================================

/**
 * Determines which buttons (Roll, Buy, Upgrade, End Turn, etc.)
 * should be visible to the player at this exact moment.
 */
const updateActionButtons = function () {
    if (!gameState) {
        return;
    }

    const player = Imperium.current_player(gameState);

    const btnRoll = getEl("btn-roll");
    const btnBuy = getEl("btn-buy");
    const btnUpgrade = getEl("btn-upgrade");
    const btnSellUpgrade = getEl("btn-sell-upgrade");
    const btnEnd = getEl("btn-end-turn");
    const btnDeclareBankruptcy = getEl("btn-declare-bankruptcy");
    const btnPayGapYear = getEl("btn-pay-gap-year");
    const btnRollGapYear = getEl("btn-roll-gap-year");
    const btnTrade = getEl("btn-trade");

    // Hide everything initially
    const allButtons = [
        btnRoll, btnBuy, btnUpgrade, btnSellUpgrade, btnEnd,
        btnDeclareBankruptcy, btnPayGapYear, btnRollGapYear,
        btnTrade];
    R.forEach(function (b) {
        if (b) {
            b.classList.add("hidden");
        }
    }, allButtons);

    if (gameState.phase === "game_over" || player.isBankrupt) {
        return;
    }

    // --- GAP YEAR LOGIC ---
    if (player.inGapYear) {
        btnPayGapYear.classList.remove("hidden");
        btnRollGapYear.classList.remove("hidden");

        // Only allow paying the buyout fee if they have enough money
        btnRollGapYear.disabled = false;
        btnPayGapYear.disabled = player.money < Imperium.gap_year_buyout;
        return;
    }

    // --- START OF TURN LOGIC ---
    if (gameState.phase === "roll" && !gameState.hasRolled) {
        btnRoll.classList.remove("hidden");
        btnRoll.disabled = false;
    }

    // --- LANDED ON TILE LOGIC ---
    if (gameState.phase === "landed") {
        btnEnd.classList.remove("hidden");
        btnTrade.classList.remove("hidden");

        const tile = Imperium.get_tile_data(player.position);

        if (tile && Imperium.is_property(player.position)) {
            const owner = Imperium.find_owner(gameState, player.position);

            if (!owner && player.money >= tile.price) {
                // Property is unowned, and they can afford it
                btnBuy.classList.remove("hidden");

            } else if (owner && owner.id === player.id) {
                // They own it, check if they can upgrade or sell upgrades
                const ownerIndex = gameState.players.indexOf(owner);
                const ownsFullSet = Imperium.owns_full_set(
                    gameState,
                    ownerIndex,
                    tile.colourGroup
                );
                const level = gameState.propertyLevels[player.position] || 0;

                if (ownsFullSet && tile.upgradeCost && level < 3) {
                    btnUpgrade.classList.remove("hidden");
                    btnUpgrade.textContent = `Upgrade — £${tile.upgradeCost}`;
                }

                if (level > 0 && tile.sellPrice) {
                    btnSellUpgrade.classList.remove("hidden");
                    btnSellUpgrade.textContent = (
                        `Downgrade — +£${tile.sellPrice}`
                    );
                }
            }
        }
    }

    // --- BANKRUPTCY LOGIC ---
    if (player.money < 0 && !player.isBankrupt) {
        btnDeclareBankruptcy.classList.remove("hidden");
        // Force them to resolve their debt or declare bankruptcy
        btnEnd.classList.add("hidden");
    }
};

// ------------------- Animations ----------------------

/**
 * Rolls the dice rapidly before landing on the final value.
 * @param {number} finalValue
 * @returns {Promise<void>}
 */
const animateDice = function (finalValue) {
    return new Promise(function (resolve) {
        const die = getEl("die-face");
        die.textContent = "?";
        die.classList.add("rolling");

        let flicks = 0;
        const interval = setInterval(function () {
            die.textContent = Math.floor(Math.random() * 6) + 1;
            flicks = flicks + 1;
            if (flicks >= 10) {
                clearInterval(interval);
                die.textContent = finalValue;
                die.classList.remove("rolling");
                resolve();
            }
        }, 60);
    });
};

/**
 * Makes the player token hop tile by tile to its destination.
 * @param {number} steps
 * @returns {Promise<void>}
 */
function animateMovement(steps) {
    return new Promise(function (resolve) {
        let player = Imperium.current_player(gameState);
        let tempPos = player.position;

        let i = 0;

        function stepLoop() {
            if (i >= steps) {
                resolve();
                return;
            }

            tempPos = tempPos + 1;

            if (tempPos > Imperium.total_tiles) {
                tempPos = 1;
            }

            let updatePosition = R.over(
                R.lensProp("position"),
                R.always(tempPos)
            );

            gameState = R.over(
                R.lensProp("players"),
                R.adjust(gameState.currentPlayerIndex, updatePosition),
                gameState
            );

            renderTokensOnBoard();

            i = i + 1;

            setTimeout(stepLoop, 200);
        }

        stepLoop();
    });
}

// ------------------ Landing Mechanics ------------------

/**
 * Called right after a player lands on a new tile.
 * It passes the game state into the Engine (Imperium.js), gets the new state,
 * and figures out what message/UI to show the user.
 */
const handleLandingUI = function () {
    const { state, action } = Imperium.handle_landing(gameState);
    gameState = state;

    // React to whatever the engine said happened
    switch (action.type) {
        case "property_unowned":
            showPropertyCard(action.tileId, false);
            break;
        case "property_owned_self":
            showPropertyCard(action.tileId, true);
            break;
        case "property_owned_other":
            showToast(
                `Paid £${action.rentAmount} rent to ${action.owner.name}`,
                "lose"
            );
            break;
        case "event":
            showEventCard(action.card);
            break;
        case "tax":
            showToast(`${action.tileName}: Lost £${action.amount}`, "lose");
            break;
        case "Student_Finance":
            showToast("Landed on Student Finance! Collected £200", "gain");
            break;
        case "go_to_gap_year":
            showToast("You Fail! Go to Gap Year!", "lose");
            break;
        case "gap_year_visiting":
            showToast("Just visiting Gap Year", "info");
            break;
        case "Student_Union":
            showToast("Student Union — relax!", "info");
            break;
    }

    // After resolving the tile, check if anyone won
    gameState = Imperium.check_winner(gameState);
    if (gameState.phase === "game_over") {
        showWinScreen(gameState.winner);
    }

    // Refresh the UI to reflect new money/property balances
    renderPlayerPanel();
    renderTokensOnBoard();
    renderOwnerIcons();
    renderUpgradeIndicators();
    updateActionButtons();
};

// --------------------- Modals ----------------------

/**
 * Opens the modal dialog with the given HTML content.
 * @param {string} html
 * @param {boolean} transparent
 */
const openModal = function (html, transparent = false, isLarge = false) {
    const overlay = getEl("modal-overlay");
    const content = getEl("modal-content");
    content.innerHTML = html;

    if (transparent) {
        content.classList.add("modal-content--transparent");
    } else {
        content.classList.remove("modal-content--transparent");
    }

    if (isLarge) {
        content.classList.add("modal-content--large");
    } else {
        content.classList.remove("modal-content--large");
    }

    overlay.classList.remove("hidden");
};

const closeModal = function () {
    getEl("modal-overlay").classList.add("hidden");
};

/**
 * Pops up a detailed card for a specific property.
 * @param {number} tileId
 * @param {boolean} infoOnly
 */
const showPropertyCard = function (tileId, infoOnly = false) {
    const tile = Imperium.get_tile_data(tileId);
    if (!tile) {
        return;
    }

    const owner = Imperium.find_owner(gameState, tileId);
    const player = Imperium.current_player(gameState);
    const playerIndex = gameState.currentPlayerIndex;

    let canBuy = false;
    if (!infoOnly && !owner && Imperium.is_property(tileId) &&
        player.money >= tile.price) {
        canBuy = true;
    }

    // Check if the current player owns this and can upgrade/downgrade
    const ownerIndex = (
        owner ?
            gameState.players.indexOf(owner) :
            -1
    );
    const isOwnerCurrentPlayer = ownerIndex === playerIndex;

    const level = gameState.propertyLevels[tileId] || 0;

    const ownsSet = (
        isOwnerCurrentPlayer
            ? Imperium.owns_full_set(
                gameState,
                ownerIndex,
                tile.colourGroup
            )
            : false
    );

    let canUpgrade = false;
    let canDowngrade = false;
    if (isOwnerCurrentPlayer && gameState.phase === "landed") {
        if (ownsSet && tile.upgradeCost && level < 3 &&
            player.money >= tile.upgradeCost) {
            canUpgrade = true;
        }
        if (level > 0 && tile.sellPrice) {
            canDowngrade = true;
        }
    }

    // Build the SVG info card view
    let imageContent = (
        Tile_Info[tileId]
            ? "<img src=\"./assets/" +
            Tile_Info[tileId] +
            "\" alt=\"" +
            tile.name +
            "\" class=\"prop-card-img\" />"
            : "<div class=\"prop-card-fallback\">No Info Card Available</div>"
    );

    let buttonsHtml = "";
    if (canBuy) {
        buttonsHtml += `<button class="action-btn
        action-btn--buy" id="modal-buy"
        style="margin-top: 10px; min-width: 120px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
            Buy — £${tile.price}
        </button>`;
    }
    if (canUpgrade) {
        buttonsHtml += `<button class="action-btn
        action-btn--upgrade" id="modal-upgrade"
        style="margin-top: 10px; min-width: 120px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
            Upgrade — £${tile.upgradeCost}
        </button>`;
    }
    if (canDowngrade) {
        buttonsHtml += `<button class="action-btn
        action-btn--downgrade" id="modal-downgrade"
        style="margin-top: 10px; min-width: 120px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
            Downgrade +£${tile.sellPrice}
        </button>`;
    }
    buttonsHtml += `<button class="action-btn
    action-btn--end" id="modal-close"
    style="margin-top: 10px; min-width: 120px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
        Close
    </button>`;

    let html = `
    <div class="prop-card-image-container">
        ${imageContent}
    </div>
    <div style="text-align: center; display: flex;
    justify-content: center; gap: 10px; flex-wrap: wrap;">
        ${buttonsHtml}
    </div>`;

    openModal(html, true);

    // Wire up the dynamic buttons
    getEl("modal-close").addEventListener("click", closeModal);

    if (canBuy) {
        getEl("modal-buy").addEventListener("click", function () {
            gameState = Imperium.buy_property(gameState);
            showToast(`Bought ${tile.name} for £${tile.price}!`, "gain");
            closeModal();
            renderPlayerPanel();
            renderOwnerIcons();
            updateActionButtons();
        });
    }
    if (canUpgrade) {
        getEl("modal-upgrade").addEventListener("click", function () {
            const levelBefore = gameState.propertyLevels[tileId] || 0;
            gameState = Imperium.upgrade_property(gameState, tileId);
            const levelAfter = gameState.propertyLevels[tileId] || 0;
            if (levelAfter > levelBefore) {
                const degreeName = Degree_Names[levelAfter] || `Level
                ${levelAfter}`;
                showToast(`Upgraded ${tile.name} to ${degreeName}!`, "gain");
            }
            closeModal();
            renderPlayerPanel();
            renderUpgradeIndicators();
            updateActionButtons();
        });
    }
    if (canDowngrade) {
        getEl("modal-downgrade").addEventListener("click", function () {
            gameState = Imperium.sell_property_upgrade(gameState, tileId);
            const levelAfter = gameState.propertyLevels[tileId] || 0;
            const degreeName = (
                levelAfter > 0
                    ? (Degree_Names[levelAfter] || ("Level " + levelAfter))
                    : "no degree"
            );
            showToast(`Downgraded ${tile.name} to ${degreeName}!`, "gain");
            closeModal();
            renderPlayerPanel();
            renderUpgradeIndicators();
            updateActionButtons();
        });
    }
};

/** Quick wrapper to show property info when clicked on the board. */
const showPropertyInfo = function (tileId) {
    const tile = Imperium.get_tile_data(tileId);
    // Only show for buyable property tiles
    if (!tile || tile.type !== "property") {
        return;
    }
    showPropertyCard(tileId, true);
};

/** Shows a fun modal when an Event Card is drawn. */
const showEventCard = function (card) {
    const effect = card.effect;
    const isGain = effect.type === "gain" || effect.type === "move";

    let effectText = "";
    if (effect.type === "gain") {
        effectText = `+£${effect.amount}`;
    } else if (effect.type === "lose") {
        effectText = `-£${effect.amount}`;
    } else {
        const tileName = (
            Imperium.get_tile_data(effect.tileId)?.name ||
            `Tile ${effect.tileId}`
        );
        effectText = `Move to ${tileName}`;
    }
    let gainClass = (
        isGain
            ? "gain"
            : "lose"
    );

    let html = (
        "<div class=\"event-card-modal\">" +
        "<div class=\"event-card-top\">" +
        "<div class=\"event-card-subtitle\">Event Card</div>" +
        "<h2>" + card.title + "</h2>" +
        "</div>" +
        "<div class=\"event-card-body\">" +
        "<p>" + card.description + "</p>" +
        "<div class=\"event-card-effect " + gainClass + "\">" +
        effectText +
        "</div>" +
        "<button class=\"action-btn action-btn--end\" " +
        "id=\"modal-close\" style=\"width:100%\">OK</button>" +
        "</div>" +
        "</div>"
    );

    openModal(html);

    getEl("modal-close").addEventListener("click", function () {
        closeModal();
        if (effect.type === "move") {
            // Re-render and trigger a landing effect since they were moved
            renderTokensOnBoard();
            renderPlayerPanel();
            handleLandingUI();
        } else {
            renderPlayerPanel();
            renderTokensOnBoard();
            updateActionButtons();
        }
    });
};

// -------------------- Toast Notifications --------------------

/**
 * Shows a quick fading notification at the bottom.
 * @param {string} message
 * @param {string} [type="info"]
 */
const showToast = function (message, type = "info") {
    const container = getEl("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
};

// --------------- Wiring Action Buttons to Logic ---------------

const wireButtons = function () {

    // Roll Dice
    getEl("btn-roll").addEventListener("click", function () {
        getEl("btn-roll").disabled = true;

        // 1. Roll in state
        gameState = Imperium.roll_dice(gameState);
        let rolledValue = gameState.lastDiceValue;

        animateDice(rolledValue).then(function () {

            // 2. Play hopping animation
            let playerBefore = Imperium.current_player(gameState);

            animateMovement(rolledValue).then(function () {

                // 3. Revert position before final state move
                let revertPosition = R.over(
                    R.lensProp("position"),
                    R.always(playerBefore.position)
                );

                gameState = R.over(
                    R.lensProp("players"),
                    R.adjust(gameState.currentPlayerIndex, revertPosition),
                    gameState
                );

                // 4. Real move (game logic)
                gameState = Imperium.move_player(gameState, rolledValue);

                renderTokensOnBoard();
                renderPlayerPanel();
                handleLandingUI();

                getEl("btn-roll").disabled = false;
            });
        });
    });
    // Buy Property
    getEl("btn-buy").addEventListener("click", function () {
        const player = Imperium.current_player(gameState);
        const tile = Imperium.get_tile_data(player.position);

        gameState = Imperium.buy_property(gameState);
        if (tile) {
            showToast(`Bought ${tile.name} for £${tile.price}!`, "gain");
        }

        renderPlayerPanel();
        renderOwnerIcons();
        updateActionButtons();
    });

    // Upgrade Degree
    getEl("btn-upgrade").addEventListener("click", function () {
        const player = Imperium.current_player(gameState);
        const tile = Imperium.get_tile_data(player.position);
        if (!tile) {
            return;
        }

        const levelBefore = gameState.propertyLevels[player.position] || 0;
        gameState = Imperium.upgrade_property(gameState, player.position);
        const levelAfter = gameState.propertyLevels[player.position] || 0;

        if (levelAfter > levelBefore) {
            const degreeName = Degree_Names[levelAfter] || `Level
            ${levelAfter}`;
            showToast(`Upgraded ${tile.name} to ${degreeName}!`, "gain");
        }
        renderPlayerPanel();
        renderUpgradeIndicators();
        updateActionButtons();
    });

    // Downgrade Degree
    getEl("btn-sell-upgrade").addEventListener("click", function () {
        const player = Imperium.current_player(gameState);
        const tile = Imperium.get_tile_data(player.position);
        if (!tile) {
            return;
        }

        gameState = Imperium.sell_property_upgrade(gameState, player.position);

        let levelAfter = gameState.propertyLevels[player.position] || 0;

        let degreeName = (
            levelAfter > 0
                ? (Degree_Names[levelAfter] || ("Level " + levelAfter))
                : "no degree"
        );

        showToast(
            "Downgraded " + tile.name + " to " + degreeName + "!",
            "gain"
        );

        renderPlayerPanel();
        renderUpgradeIndicators();
        updateActionButtons();
    });

    // End Turn
    getEl("btn-end-turn").addEventListener("click", function () {
        gameState = Imperium.end_turn(gameState);
        getEl("die-face").textContent = "?";

        renderPlayerPanel();
        renderTokensOnBoard();
        updateActionButtons();

        // Let them know if the next player is stuck in Gap Year
        const nextPlayer = Imperium.current_player(gameState);
        if (nextPlayer.inGapYear) {
            showToast(`${nextPlayer.name} is in Gap Year!`, "info");
        }
    });

    // Declare Bankruptcy
    getEl("btn-declare-bankruptcy").addEventListener("click", function () {
        const player = Imperium.current_player(gameState);

        gameState = Imperium.declare_bankruptcy(
            gameState,
            gameState.currentPlayerIndex
        );
        showToast(`${player.name} has declared bankruptcy!`, "lose");

        // Skip their turn and check if game ended
        gameState = Imperium.end_turn(gameState);
        gameState = Imperium.check_winner(gameState);

        if (gameState.phase === "game_over") {
            showWinScreen(gameState.winner);
        }

        renderPlayerPanel();
        renderTokensOnBoard();
        renderOwnerIcons();
        updateActionButtons();
    });

    // Pay gap year buyout
    getEl("btn-pay-gap-year").addEventListener("click", function () {
        const player = Imperium.current_player(gameState);

        if (player.money < Imperium.gap_year_buyout) {
            showToast("Not enough money to buy out!", "lose");
            return;
        }

        const result = Imperium.handle_gap_year_turn(gameState, "pay");
        gameState = result.state;

        showToast("Paid £50 buyout — you're free!", "lose");
        renderPlayerPanel();
        renderTokensOnBoard();
        updateActionButtons();
    });

    // Roll to escape Gap year
    getEl("btn-roll-gap-year").addEventListener("click", function () {
        getEl("btn-roll-gap-year").disabled = true;
        getEl("btn-pay-gap-year").disabled = true;

        let result = Imperium.handle_gap_year_turn(gameState, "roll");
        gameState = result.state;

        animateDice(result.diceValue).then(function () {

            if (result.escaped) {

                showToast(
                    "Rolled a " + result.diceValue + " — you're free!",
                    "gain"
                );

                if (result.diceValue === Imperium.gap_year_escape_number) {
                    renderTokensOnBoard();
                    renderPlayerPanel();
                    handleLandingUI();
                    return;
                }

                gameState = Imperium.end_turn(gameState);

            } else {

                showToast(
                    "Rolled a " + result.diceValue +
                    " — need a " + Imperium.gap_year_escape_number +
                    ". Turn missed.",
                    "lose"
                );

                gameState = Imperium.end_turn(gameState);
            }

            getEl("die-face").textContent = "?";
            renderPlayerPanel();
            renderTokensOnBoard();
            updateActionButtons();

        });
    });

    // Modal Background Click
    getEl("modal-overlay").addEventListener("click", function (e) {
        if (e.target.id === "modal-overlay") {
            closeModal();
        }
    });

    // Trade Modal Logic
    getEl("btn-trade").addEventListener("click", function () {
        if (!gameState) {
            return;
        }
        const playerIndex = gameState.currentPlayerIndex;

        // Select an opponent
        let optionsHtml = gameState.players.map(function (p, i) {
            if (i === playerIndex || p.isBankrupt) {
                return "";
            }
            return `<option value="${i}">${p.name} ${p.emoji}</option>`;
        }).join("");

        if (!optionsHtml.trim()) {
            showToast("No active players to trade with.", "lose");
            return;
        }

        let html = `
        <div style="text-align:center; padding: 20px;
        color: var(--text-primary);">
            <h2 style="margin-top:0;">Trade</h2>
            <p>Select a player to trade with:</p>
            <select id="trade-target" aria-label="Select player to trade with"
            class="trade-input" style="width: 200px;
            margin-bottom: 20px;">
                ${optionsHtml}
            </select>
            <br/>
            <button class="action-btn action-btn--buy"
            id="trade-next">Next</button>
            <button class="action-btn action-btn--end" id="trade-cancel"
            style="margin-left: 10px;">Cancel</button>
        </div>`;

        openModal(html, false);

        getEl("trade-cancel").addEventListener("click", closeModal);
        getEl("trade-next").addEventListener("click", function () {
            const targetIndex = parseInt(getEl("trade-target").value, 10);
            openTradeOfferBuilder(playerIndex, targetIndex);
        });
    });

    // Global Keyboard Accessibility
    document.addEventListener("keydown", function (e) {
        // Don't trigger if typing in an input
        if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") {
            return;
        }

        const overlay = getEl("modal-overlay");
        const isModalOpen = !overlay.classList.contains("hidden");

        // Map keys to buttons if the button is visible and not disabled
        const triggerBtn = function (id) {
            const btn = getEl(id);
            if (btn && !btn.classList.contains("hidden") && !btn.disabled) {
                btn.click();
                return true;
            }
            return false;
        };

        // Escape to close modal
        if (e.key === "Escape") {
            if (isModalOpen) {
                closeModal();
            }
            return;
        }

        switch (e.key.toLowerCase()) {
            case "enter":
                if (isModalOpen) {
                    triggerBtn("modal-close");
                    // If trade builder or event card is open
                    // with their own confirm/ok buttons
                    triggerBtn("trade-confirm");
                    triggerBtn("trade-next");
                } else {
                    if (!triggerBtn("btn-roll")) {
                        triggerBtn("btn-end-turn");
                        triggerBtn("btn-roll-gap-year");
                    }
                }
                break;
            case "q":
                triggerBtn("btn-buy");
                triggerBtn("btn-pay-gap-year");
                break;
            case "w":
                triggerBtn("btn-upgrade");
                break;
            case "s":
                triggerBtn("btn-sell-upgrade");
                break;
            case "d":
                triggerBtn("btn-end-turn");
                break;
            case "t":
                triggerBtn("btn-trade");
                break;
            case "k":
                triggerBtn("btn-declare-bankruptcy");
                break;
        }
    });
};

/**
 * Opens the two-column trade offer builder.
 */
const openTradeOfferBuilder = function (fromIndex, toIndex) {
    const playerA = gameState.players[fromIndex];
    const playerB = gameState.players[toIndex];

    const renderProps = function (player, prefix) {
        if (player.properties.length === 0) {
            return `<p style="font-size: 0.8rem;
            color: var(--text-muted); text-align: center;">No properties</p>`;
        }
        return player.properties.map(function (tileId) {
            let data = Imperium.get_tile_data(tileId);
            let level = gameState.propertyLevels[tileId] || 0;

            let disabled = (
                level > 0
                    ? "disabled"
                    : ""
            );

            let disabledText = (
                level > 0
                    ? " <span style=\"color:var(--text-danger);" +
                    "font-size:0.7rem;\">" +
                    "(Upgraded)</span>"
                    : ""
            );

            return (
                "<label class=\"trade-property-btn\" " +
                "style=\"opacity:" + (
                    level > 0
                        ? 0.5
                        : 1
                ) + ";\">" +

                "<input type=\"checkbox\" " +
                "name=\"" + prefix + "-props\" " +
                "value=\"" + tileId + "\" " +
                "style=\"display:none;\" " +
                disabled + ">" +

                "<div class=\"trade-property-btn-content\">" +
                data.name + disabledText +
                "</div>" +

                "</label>"
            );
        }).join("");
    };

    let html = `
    <div style="padding: 20px; width: 100%; min-width: 480px;
    color: var(--text-primary); box-sizing: border-box;">
        <h2 style="margin-top:0; text-align:center;">Trade Offer</h2>
        <div style="display: flex; gap: 40px; flex-wrap: nowrap;">
            <!-- Player A -->
            <div style="flex: 1; padding: 20px;
            background: var(--bg-panel); border-radius: 8px;">
                <h3 style="margin-top:0; margin-bottom:15px;
                font-size:1.3rem; color: var(--accent);">
                    ${playerA.name} Offers:
                </h3>
                <label style="display:block; margin-bottom: 20px;
                font-size:1.05rem; font-weight: 600;">
                    Money (£): <br/>
                    <input type="number" id="trade-money-a"
                    class="trade-input" value="0" min="0"
                    max="${playerA.money}"
                    style="width: 100%; margin-top:8px;">
                    <small style="color: var(--text-muted); display:block;
                    margin-top:6px; font-size:0.85rem;">
                        Max: £${playerA.money}
                    </small>
                </label>
                <div style="font-weight: 600; font-size:1.05rem;
                margin-bottom:10px;">
                    Properties:
                </div>
                <div style="max-height: 200px; overflow-y: auto;
                background: rgba(0,0,0,0.2); padding: 10px;
                border-radius: 4px;">
                    ${renderProps(playerA, "a")}
                </div>
            </div>
            <!-- Player B -->
            <div style="flex: 1; padding: 20px;
            background: var(--bg-panel); border-radius: 8px;">
                <h3 style="margin-top:0; margin-bottom:15px;
                font-size:1.3rem; color: var(--accent);">
                    ${playerB.name} Offers:
                </h3>
                <label style="display:block; margin-bottom: 20px;
                font-size:1.05rem; font-weight: 600;">
                    Money (£): <br/>
                    <input type="number" id="trade-money-b"
                    class="trade-input" value="0" min="0"
                    max="${playerB.money}"
                    style="width: 100%; margin-top:8px;">
                    <small style="color: var(--text-muted); display:block;
                    margin-top:6px; font-size:0.85rem;">
                        Max: £${playerB.money}
                    </small>
                </label>
                <div style="font-weight: 600; font-size:1.05rem;
                margin-bottom:10px;">
                    Properties:
                </div>
                <div style="max-height: 200px; overflow-y: auto;
                background: rgba(0,0,0,0.2); padding: 10px;
                border-radius: 4px;">
                    ${renderProps(playerB, "b")}
                </div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button class="action-btn action-btn--buy" id="trade-confirm"
            style="width: 150px;">Execute Trade</button>
            <button class="action-btn action-btn--end"
            id="trade-cancel-builder" style="width: 150px; margin-left: 10px;">
                Cancel
            </button>
        </div>
    </div>`;

    openModal(html, false, true);

    getEl("trade-cancel-builder").addEventListener("click", closeModal);
    getEl("trade-confirm").addEventListener("click", function () {
        const moneyA = parseInt(getEl("trade-money-a").value, 10) || 0;
        const moneyB = parseInt(getEl("trade-money-b").value, 10) || 0;

        const propsA = Array.from(document.querySelectorAll(
            "input[name=\"a-props\"]:checked"
        )).map(
            function (cb) {
                return parseInt(cb.value, 10);
            }
        );
        const propsB = Array.from(document.querySelectorAll(
            "input[name=\"b-props\"]:checked"
        )).map(
            function (cb) {
                return parseInt(cb.value, 10);
            }
        );

        const offer = {
            moneyFromA: moneyA,
            moneyFromB: moneyB,
            propertiesFromA: propsA,
            propertiesFromB: propsB
        };

        const newState = Imperium.execute_trade(
            gameState,
            fromIndex,
            toIndex,
            offer
        );

        if (!newState) {
            showToast("Invalid trade offer! Check money and upgrades.", "lose");
        } else {
            gameState = newState;
            showToast(
                `Trade executed between ${playerA.name} and ${playerB.name}!`,
                "gain"
            );
            closeModal();
            renderPlayerPanel();
            renderOwnerIcons();
            updateActionButtons();
        }
    });
};

// --------------- Game Over ------------------

/**
 * Shows the win screen with the winner's details.
 * @param {Imperium.Player|undefined} winner
 */
const showWinScreen = function (winner) {
    const screen = getEl("win-screen");

    getEl("win-emoji").textContent = (
        winner
            ? winner.emoji
            : "🏆"
    );

    getEl("win-name").textContent = (
        winner
            ? (winner.name + " Wins!")
            : "Game Over!"
    );

    getEl("win-money").textContent = (
        winner
            ? ("Final Balance: £" + winner.money.toLocaleString())
            : ""
    );

    screen.classList.remove("hidden");
};

// ------------------ Boot Sequence ------------------

window.addEventListener("DOMContentLoaded", function () {
    console.log("Imperium UI Initialised — using Imperium.js");
    initHomeScreen();
    wireButtons();
});
