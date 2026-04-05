(function () {
    const configNode = document.getElementById("quiz-config");
    if (!configNode) {
        return;
    }

    const config = JSON.parse(configNode.textContent);
    const totalSteps = 6;
    const storageKey = "smart-quiz-state-v2";
    const storageVersion = 2;
    const supportStorageKey = "smart-quiz-support-v1";
    const submitUrl = document.querySelector(".quiz-app")?.dataset.submitUrl || "";
    const supportUrl = document.querySelector(".quiz-app")?.dataset.supportUrl || "";
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || "";

    const elements = {
        stage: document.getElementById("quiz-stage"),
        footer: document.getElementById("quiz-footer"),
        progressPanel: document.querySelector(".quiz-progress-panel"),
        back: document.getElementById("quiz-back"),
        next: document.getElementById("quiz-next"),
        nextLabel: document.getElementById("quiz-next-label"),
        stepLabel: document.getElementById("quiz-step-label"),
        progressValue: document.getElementById("quiz-progress-value"),
        progressFill: document.getElementById("quiz-progress-fill"),
        alert: document.getElementById("quiz-alert"),
        supportRoot: document.getElementById("support-chat"),
        supportToggle: document.getElementById("support-chat-toggle"),
        supportPanel: document.getElementById("support-chat-panel"),
        supportClose: document.getElementById("support-chat-close"),
        supportMessages: document.getElementById("support-chat-messages"),
        supportForm: document.getElementById("support-chat-form"),
        supportInput: document.getElementById("support-chat-input"),
        supportSend: document.getElementById("support-chat-send"),
    };

    const defaultState = {
        step: 0,
        intro_seen: false,
        room_type: "",
        zones: [],
        area: Number(config.area?.default || 60),
        style: "",
        budget: "",
        name: "",
        phone: "",
        email: "",
        comment: "",
        privacy_agreed: false,
        success: false,
    };

    const iconMap = {
        "Квартира": "building",
        "Частный дом": "home",
        "Офис": "briefcase",
        "Коммерческое помещение": "store",
        "Студия / апартаменты": "spark",
        "Другое": "more",
        "Кухня": "kitchen",
        "Гостиная": "sofa",
        "Спальня": "bed",
        "Детская": "star",
        "Санузел": "drop",
        "Прихожая": "door",
        "Кабинет": "desk",
        "Гардеробная": "wardrobe",
        "Балкон / лоджия": "leaf",
        "Полностью всё помещение": "grid",
        "Современный": "spark",
        "Минимализм": "circle",
        "Скандинавский": "snow",
        "Лофт": "grid",
        "Неоклассика": "pillar",
        "Классика": "diamond",
        "Пока не определился": "question",
        "До 500 000 ₽": "wallet",
        "500 000 – 1 000 000 ₽": "coins",
        "1 000 000 – 2 000 000 ₽": "gem",
        "От 2 000 000 ₽": "crown",
        "Пока не знаю": "question",
    };

    const styleThemes = {
        "Современный": {
            title: "Clean lines",
            description: "Чистые линии, графика и технологичный ритм пространства.",
            gradient: "linear-gradient(135deg, #4f61ff 0%, #a730ff 100%)",
        },
        "Минимализм": {
            title: "Light silence",
            description: "Спокойные оттенки, воздух и лаконичные формы без лишнего шума.",
            gradient: "linear-gradient(135deg, #cfd6e4 0%, #eef1f7 100%)",
        },
        "Скандинавский": {
            title: "Soft daylight",
            description: "Светлая палитра, уютная фактура и ощущение тепла.",
            gradient: "linear-gradient(135deg, #bcd7ff 0%, #eef4ff 100%)",
        },
        "Лофт": {
            title: "Urban raw",
            description: "Контраст, индустриальные акценты и характер пространства.",
            gradient: "linear-gradient(135deg, #474d62 0%, #8a5f75 100%)",
        },
        "Неоклассика": {
            title: "Elegant balance",
            description: "Сдержанная роскошь, симметрия и мягкая пластика форм.",
            gradient: "linear-gradient(135deg, #d4b896 0%, #f1dcc8 100%)",
        },
        "Классика": {
            title: "Timeless",
            description: "Традиции, выразительные детали и благородные оттенки.",
            gradient: "linear-gradient(135deg, #8e6a2c 0%, #e3c17f 100%)",
        },
        "Пока не определился": {
            title: "Open mood",
            description: "Подберём направление вместе и предложим несколько решений.",
            gradient: "linear-gradient(135deg, #7392ff 0%, #ef8cff 100%)",
        },
    };

    let state = hydrateState();
    let supportMessages = hydrateSupportMessages();
    let supportOpen = false;
    let supportSubmitting = false;
    let fieldErrors = {};
    let isSubmitting = false;

    elements.back.addEventListener("click", handleBack);
    elements.next.addEventListener("click", handleNext);
    bindSupportEvents();
    renderSupport();

    trackEvent("quiz_start");
    render("forward");

    function hydrateState() {
        try {
            const saved = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
            if (saved.__version !== storageVersion) {
                return { ...defaultState };
            }
            return {
                ...defaultState,
                ...saved,
                zones: Array.isArray(saved.zones) ? saved.zones : [],
                step: clampStep(saved.step ?? defaultState.step),
                area: Number(saved.area ?? defaultState.area),
            };
        } catch (error) {
            return { ...defaultState };
        }
    }

    function persistState() {
        sessionStorage.setItem(
            storageKey,
            JSON.stringify({
                ...state,
                __version: storageVersion,
            }),
        );
    }

    function hydrateSupportMessages() {
        try {
            const saved = JSON.parse(sessionStorage.getItem(supportStorageKey) || "[]");
            if (!Array.isArray(saved)) {
                return [];
            }
            return saved
                .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
                .slice(-12);
        } catch (error) {
            return [];
        }
    }

    function persistSupportMessages() {
        sessionStorage.setItem(supportStorageKey, JSON.stringify(supportMessages.slice(-12)));
    }

    function clampStep(step) {
        return Math.max(0, Math.min(totalSteps + 1, Number(step) || 0));
    }

    function findConfigItem(items, value) {
        return (items || []).find((item) => item?.value === value || item?.label === value) || null;
    }

    function getSelectedRoom() {
        return findConfigItem(config.rooms, state.room_type);
    }

    function getSelectedStyle() {
        return findConfigItem(config.styles, state.style);
    }

    function getSelectedZones() {
        return state.zones
            .map((zone) => findConfigItem(config.zones, zone))
            .filter(Boolean);
    }

    function getZoneCoefficient() {
        const coefficients = getSelectedZones()
            .map((zone) => Number(zone.zone_kf || 0))
            .filter((value) => value > 0);

        if (!coefficients.length) {
            return 0;
        }

        return coefficients.reduce((sum, value) => sum + value, 0) / coefficients.length;
    }

    function formatFactor(value) {
        return Number(value || 0).toFixed(2);
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            maximumFractionDigits: 0,
        }).format(Math.round(Number(value || 0)));
    }

    function getEstimate() {
        const room = getSelectedRoom();
        const style = getSelectedStyle();
        const area = Number(state.area || 0);
        const basePrice = Number(room?.base_price || 0);
        const zoneKf = getZoneCoefficient();
        const styleKf = Number(style?.style_kf || 0);

        if (area <= 0 || basePrice <= 0 || zoneKf <= 0 || styleKf <= 0) {
            return null;
        }

        return {
            total: Math.round(basePrice * area * zoneKf * styleKf),
            basePrice,
            area,
            zoneKf,
            styleKf,
        };
    }

    function renderEstimateCard() {
        const estimate = getEstimate();

        if (!estimate) {
            return `
                <div class="quiz-summary-estimate is-muted">
                    <span class="quiz-summary-estimate-kicker">Примерная сумма с учетом услуг</span>
                    <strong>Рассчитаем после выбора коэффициентов</strong>
                    <p>Когда для помещения, зон и стиля заполнены цены и коэффициенты, здесь появится итоговая ориентировочная сумма.</p>
                </div>
            `;
        }

        return `
            <div class="quiz-summary-estimate">
                <span class="quiz-summary-estimate-kicker">Примерная сумма с учетом услуг</span>
                <strong>${escapeHtml(formatCurrency(estimate.total))}</strong>
                <p>${escapeHtml(`${formatCurrency(estimate.basePrice)} × ${estimate.area} м² × ${formatFactor(estimate.zoneKf)} × ${formatFactor(estimate.styleKf)}`)}</p>
            </div>
        `;
    }

    function canShowSupport() {
        return state.step > 0 && state.step <= totalSteps && !state.success;
    }

    function buildSupportPayload(message) {
        const estimate = getEstimate();
        return {
            message,
            history: supportMessages.slice(-8),
            quiz_state: {
                step: state.step,
                room_type: state.room_type,
                zones: state.zones,
                area: state.area,
                style: state.style,
                budget: state.budget,
                estimated_price: estimate?.total || null,
            },
        };
    }

    function renderSupportMessages() {
        if (!elements.supportMessages) {
            return;
        }

        const messages = supportMessages.length
            ? supportMessages
            : [{
                role: "assistant",
                content: "Я на связи. Могу помочь понять расчёт цены, подсказать по стилям или разобраться с ошибкой на сайте.",
            }];

        elements.supportMessages.innerHTML = messages
            .map(
                (item) => `
                    <article class="support-chat-message is-${item.role}">
                        <div class="support-chat-bubble">${escapeHtml(item.content)}</div>
                    </article>
                `,
            )
            .join("");

        if (supportSubmitting) {
            elements.supportMessages.insertAdjacentHTML(
                "beforeend",
                `
                    <article class="support-chat-message is-assistant is-loading">
                        <div class="support-chat-bubble">Подбираю ответ…</div>
                    </article>
                `,
            );
        }

        elements.supportMessages.scrollTop = elements.supportMessages.scrollHeight;
    }

    function renderSupport() {
        if (!elements.supportRoot || !elements.supportPanel || !elements.supportToggle) {
            return;
        }

        const visible = canShowSupport();
        elements.supportRoot.classList.toggle("is-hidden", !visible);
        if (!visible) {
            supportOpen = false;
        }

        elements.supportPanel.hidden = !supportOpen;
        elements.supportToggle.setAttribute("aria-expanded", String(supportOpen));
        renderSupportMessages();

        if (elements.supportSend) {
            elements.supportSend.disabled = supportSubmitting;
        }
        if (elements.supportInput) {
            elements.supportInput.disabled = supportSubmitting;
            autoResizeSupportInput();
        }
    }

    function autoResizeSupportInput() {
        if (!elements.supportInput) {
            return;
        }
        elements.supportInput.style.height = "auto";
        elements.supportInput.style.height = `${Math.min(elements.supportInput.scrollHeight, 140)}px`;
    }

    function pushSupportMessage(role, content) {
        supportMessages = [...supportMessages, { role, content }].slice(-12);
        persistSupportMessages();
        renderSupportMessages();
    }

    async function readJsonResponse(response) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return response.json();
        }

        const text = await response.text();
        const cleanText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        throw {
            message: cleanText || "Сервис временно вернул некорректный ответ. Попробуйте ещё раз.",
            raw: text,
        };
    }

    async function sendSupportMessage(rawMessage) {
        const message = rawMessage.trim();
        if (!message || supportSubmitting || !supportUrl) {
            return;
        }

        const requestPayload = buildSupportPayload(message);
        pushSupportMessage("user", message);
        supportSubmitting = true;
        if (elements.supportInput) {
            elements.supportInput.value = "";
            autoResizeSupportInput();
        }
        renderSupport();

        try {
            const response = await fetch(supportUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify(requestPayload),
            });
            const result = await readJsonResponse(response);

            if (!response.ok || result.status !== "success") {
                throw result;
            }

            pushSupportMessage("assistant", String(result.message || "").trim());
        } catch (error) {
            const fallbackMessage = error?.message || "Сейчас AI-поддержка недоступна. Попробуйте ещё раз чуть позже.";
            pushSupportMessage("assistant", fallbackMessage);
        } finally {
            supportSubmitting = false;
            renderSupport();
        }
    }

    function bindSupportEvents() {
        elements.supportToggle?.addEventListener("click", () => {
            if (!canShowSupport()) {
                return;
            }
            supportOpen = !supportOpen;
            renderSupport();
        });

        elements.supportClose?.addEventListener("click", () => {
            supportOpen = false;
            renderSupport();
        });

        elements.supportForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            sendSupportMessage(elements.supportInput?.value || "");
        });

        elements.supportInput?.addEventListener("input", autoResizeSupportInput);
        elements.supportInput?.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendSupportMessage(elements.supportInput?.value || "");
            }
        });

        document.querySelectorAll("[data-support-question]").forEach((button) => {
            button.addEventListener("click", () => {
                supportOpen = true;
                renderSupport();
                sendSupportMessage(button.dataset.supportQuestion || "");
            });
        });
    }

    function render(direction) {
        updateProgress();
        renderAlert();
        renderSupport();

        if (state.success) {
            elements.progressPanel.classList.remove("is-hidden");
            elements.footer.classList.add("is-hidden");
            renderSuccess();
            return;
        }

        const isIntro = state.step === 0;
        elements.progressPanel.classList.toggle("is-hidden", isIntro);
        elements.footer.classList.toggle("is-hidden", isIntro);

        if (isIntro) {
            const introWrapper = document.createElement("div");
            introWrapper.className = `quiz-step ${direction === "backward" ? "is-backward" : ""} ${direction === "none" ? "is-visible is-static" : ""}`;
            introWrapper.innerHTML = getStepMarkup(state.step);
            elements.stage.replaceChildren(introWrapper);
            bindStepEvents();

            if (direction !== "none") {
                requestAnimationFrame(() => introWrapper.classList.add("is-visible"));
            }
            return;
        }

        elements.footer.classList.remove("is-hidden");
        elements.back.disabled = state.step === 1 || isSubmitting;
        elements.next.disabled = !canProceed() || isSubmitting;
        elements.nextLabel.textContent = state.step === totalSteps ? (isSubmitting ? "Отправка..." : "Получить консультацию") : "Далее";

        const wrapper = document.createElement("div");
        wrapper.className = `quiz-step ${direction === "backward" ? "is-backward" : ""} ${direction === "none" ? "is-visible is-static" : ""}`;
        wrapper.innerHTML = getStepMarkup(state.step);
        elements.stage.replaceChildren(wrapper);
        bindStepEvents();

        if (direction !== "none") {
            requestAnimationFrame(() => wrapper.classList.add("is-visible"));
        }
        trackStepView();
    }

    function updateProgress() {
        if (state.step === 0) {
            elements.stepLabel.textContent = "Введение";
            elements.progressValue.textContent = "0%";
            elements.progressFill.style.width = "0%";
            return;
        }
        const visibleStep = state.success ? totalSteps : state.step;
        const percent = Math.round((visibleStep / totalSteps) * 100);
        elements.stepLabel.textContent = state.success ? "Заявка отправлена" : `Шаг ${visibleStep} из ${totalSteps}`;
        elements.progressValue.textContent = `${percent}%`;
        elements.progressFill.style.width = `${percent}%`;
    }

    function renderAlert() {
        const message = state.success ? config.success_message : "";
        if (state.success && message) {
            elements.alert.hidden = false;
            elements.alert.className = "quiz-alert is-success";
            elements.alert.textContent = message;
            return;
        }

        if (fieldErrors.form) {
            elements.alert.hidden = false;
            elements.alert.className = "quiz-alert is-error";
            elements.alert.textContent = fieldErrors.form;
            return;
        }

        elements.alert.hidden = true;
        elements.alert.textContent = "";
        elements.alert.className = "quiz-alert";
    }

    function renderSuccess() {
        elements.stage.innerHTML = `
            <div class="quiz-success">
                <div class="quiz-success-badge">${icon("check")}</div>
                <div>
                    <h2>Спасибо, заявка уже у нас</h2>
                    <p>${escapeHtml(config.success_message)}</p>
                </div>
                <button type="button" class="quiz-nav quiz-nav-primary" data-action="restart">
                    Пройти ещё раз
                </button>
            </div>
        `;
        elements.stage.querySelector('[data-action="restart"]').addEventListener("click", resetQuiz);
        trackEvent("quiz_success");
    }

    function handleBack() {
        if (state.step <= 1 || isSubmitting) {
            return;
        }

        state.step -= 1;
        fieldErrors = {};
        persistState();
        render("backward");
    }

    function handleNext() {
        if (isSubmitting) {
            return;
        }

        if (!validateCurrentStep()) {
            render("forward");
            return;
        }

        fieldErrors = {};

        if (state.step < totalSteps) {
            state.step += 1;
            persistState();
            render("forward");
            return;
        }

        submitQuiz();
    }

    function validateCurrentStep() {
        fieldErrors = {};

        if (state.step === 1 && !state.room_type) {
            fieldErrors.form = "Выберите тип помещения, чтобы перейти дальше.";
        }
        if (state.step === 2 && state.zones.length === 0) {
            fieldErrors.form = "Выберите хотя бы одну зону проекта.";
        }
        if (state.step === 4 && !state.style) {
            fieldErrors.form = "Выберите подходящий стиль интерьера.";
        }
        if (state.step === 5 && !state.budget) {
            fieldErrors.form = "Укажите ориентировочный бюджет.";
        }
        if (state.step === 6) {
            if (!state.phone.trim()) {
                fieldErrors.phone = "Телефон обязателен.";
            } else if (state.phone.replace(/\D/g, "").length < 11) {
                fieldErrors.phone = "Введите корректный номер телефона.";
            }
            if (!state.privacy_agreed) {
                fieldErrors.privacy = "Нужно согласиться на обработку персональных данных.";
            }
            if (fieldErrors.phone || fieldErrors.privacy) {
                fieldErrors.form = "Проверьте обязательные поля формы.";
            }
        }

        return Object.keys(fieldErrors).length === 0;
    }

    function canProceed() {
        if (state.step === 0) {
            return false;
        }
        if (state.step === 1) {
            return Boolean(state.room_type);
        }
        if (state.step === 2) {
            return state.zones.length > 0;
        }
        if (state.step === 4) {
            return Boolean(state.style);
        }
        if (state.step === 5) {
            return Boolean(state.budget);
        }
        if (state.step === 6) {
            return Boolean(state.phone.trim()) && state.privacy_agreed;
        }
        return true;
    }

    function bindStepEvents() {
        const startButton = elements.stage.querySelector("[data-start-quiz]");
        if (startButton) {
            startButton.addEventListener("click", () => {
                state.step = 1;
                state.intro_seen = true;
                persistState();
                render("forward");
            });
        }

        elements.stage.querySelectorAll("[data-room]").forEach((button) => {
            button.addEventListener("click", () => {
                state.room_type = button.dataset.room;
                fieldErrors = {};
                persistState();
                render("none");
            });
        });

        elements.stage.querySelectorAll("[data-zone]").forEach((button) => {
            button.addEventListener("click", () => {
                const zone = button.dataset.zone;
                state.zones = state.zones.includes(zone)
                    ? state.zones.filter((item) => item !== zone)
                    : [...state.zones, zone];
                fieldErrors = {};
                persistState();
                render("none");
            });
        });

        const range = elements.stage.querySelector("[data-area-range]");
        if (range) {
            range.addEventListener("input", (event) => {
                state.area = Number(event.target.value);
                persistState();
                syncRange(range);
                const areaValue = elements.stage.querySelector("[data-area-value]");
                if (areaValue) {
                    areaValue.textContent = String(state.area);
                }
            });
            syncRange(range);
        }

        elements.stage.querySelectorAll("[data-area-preset]").forEach((button) => {
            button.addEventListener("click", () => {
                state.area = Number(button.dataset.areaPreset);
                persistState();
                render("none");
            });
        });

        elements.stage.querySelectorAll("[data-style]").forEach((button) => {
            button.addEventListener("click", () => {
                state.style = button.dataset.style;
                fieldErrors = {};
                persistState();
                render("none");
            });
        });

        elements.stage.querySelectorAll("[data-budget]").forEach((button) => {
            button.addEventListener("click", () => {
                state.budget = button.dataset.budget;
                fieldErrors = {};
                persistState();
                render("none");
            });
        });

        const nameInput = elements.stage.querySelector('input[name="name"]');
        const phoneInput = elements.stage.querySelector('input[name="phone"]');
        const emailInput = elements.stage.querySelector('input[name="email"]');
        const commentInput = elements.stage.querySelector('textarea[name="comment"]');
        const privacyInput = elements.stage.querySelector('input[name="privacy_agreed"]');

        if (nameInput) {
            nameInput.addEventListener("input", (event) => updateField("name", event.target.value));
        }
        if (phoneInput) {
            phoneInput.addEventListener("input", (event) => {
                updateField("phone", formatPhone(event.target.value), false);
                event.target.value = state.phone;
            });
        }
        if (emailInput) {
            emailInput.addEventListener("input", (event) => updateField("email", event.target.value));
        }
        if (commentInput) {
            commentInput.addEventListener("input", (event) => updateField("comment", event.target.value));
        }
        if (privacyInput) {
            privacyInput.addEventListener("change", (event) => {
                updateField("privacy_agreed", event.target.checked, true);
            });
        }

        const summaryPanel = elements.stage.querySelector(".quiz-summary-panel");
        if (summaryPanel && !summaryPanel.querySelector(".quiz-summary-estimate")) {
            const heading = summaryPanel.querySelector("h3");
            heading?.insertAdjacentHTML("afterend", renderEstimateCard());
        }
    }

    function updateField(field, value, rerender) {
        state[field] = value;

        if (field === "phone" && fieldErrors.phone) {
            delete fieldErrors.phone;
        }
        if (field === "privacy_agreed" && fieldErrors.privacy) {
            delete fieldErrors.privacy;
        }
        if (fieldErrors.form) {
            delete fieldErrors.form;
        }

        persistState();
        if (rerender) {
            render("none");
        } else {
            elements.next.disabled = !canProceed() || isSubmitting;
        }
    }

    function syncRange(range) {
        const min = Number(range.min);
        const max = Number(range.max);
        const current = Number(range.value);
        const percent = ((current - min) / (max - min)) * 100;
        range.style.background = `linear-gradient(90deg, #5967ff 0%, #b12dff ${percent}%, #edf0f8 ${percent}%, #edf0f8 100%)`;
    }

    async function submitQuiz() {
        isSubmitting = true;
        elements.next.disabled = true;
        elements.back.disabled = true;
        elements.nextLabel.textContent = "Отправка...";
        fieldErrors = {};
        renderAlert();
        trackEvent("quiz_submit");

        const payload = {
            ...state,
            page_url: window.location.href,
            ...getUtmData(),
        };

        try {
            const response = await fetch(submitUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify(payload),
            });
            const result = await readJsonResponse(response);

            if (!response.ok || result.status !== "success") {
                throw result;
            }

            state.success = true;
            state.step = totalSteps + 1;
            persistState();
            render("forward");
        } catch (error) {
            fieldErrors = {
                form: error?.message || config.error_message,
            };
            isSubmitting = false;
            render("forward");
            return;
        }

        isSubmitting = false;
    }

    function getStepMarkup(step) {
        if (step === 0) {
            return `
                <section class="quiz-intro">
                    <div class="quiz-intro-copy">
                        <p class="quiz-intro-kicker">Дизайн-проект помещения</p>
                        <h2 class="quiz-intro-title">${escapeHtml(config.title)}</h2>
                        <p class="quiz-intro-text">
                            Спасибо, что выбираете нашу компанию. Мы поможем подобрать интерьер вашей мечты,
                            соберем ключевые пожелания и предложим направление, которое подойдет именно вам.
                        </p>
                        <div class="quiz-intro-points">
                            <div class="quiz-intro-point">
                                <span class="quiz-intro-point-icon">${icon("spark")}</span>
                                <div>
                                    <strong>6 понятных шагов</strong>
                                    <span>Быстрый бриф без лишней нагрузки.</span>
                                </div>
                            </div>
                            <div class="quiz-intro-point">
                                <span class="quiz-intro-point-icon">${icon("grid")}</span>
                                <div>
                                    <strong>Подбор под ваш запрос</strong>
                                    <span>Учтем помещение, зоны, площадь, стиль и бюджет.</span>
                                </div>
                            </div>
                            <div class="quiz-intro-point">
                                <span class="quiz-intro-point-icon">${icon("check")}</span>
                                <div>
                                    <strong>Быстрый старт общения</strong>
                                    <span>После отправки мы выйдем на связь с уже понятным брифом.</span>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="quiz-nav quiz-nav-primary quiz-intro-button" data-start-quiz>
                            <span>Начать заполнение формы</span>
                            <span aria-hidden="true">›</span>
                        </button>
                    </div>
                    <div class="quiz-intro-visual" aria-hidden="true">
                        <div class="quiz-intro-orb quiz-intro-orb-main"></div>
                        <div class="quiz-intro-orb quiz-intro-orb-secondary"></div>
                        <div class="quiz-intro-card">
                            <div class="quiz-intro-card-badge">Interior Form</div>
                            <div class="quiz-intro-card-title">Подберем интерьер под ваш сценарий жизни</div>
                            <div class="quiz-intro-card-grid">
                                <span>Планировка</span>
                                <span>Стиль</span>
                                <span>Бюджет</span>
                                <span>Зоны</span>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }

        if (step === 1) {
            return `
                <div class="quiz-step-header">
                    <h2 class="quiz-step-title">Какое помещение вы планируете оформить?</h2>
                    <p class="quiz-step-subtitle">Выберите тип помещения для дизайн-проекта.</p>
                </div>
                <div class="quiz-options-grid">
                    ${config.rooms.map((item) => renderRoomCard(item)).join("")}
                </div>
            `;
        }

        if (step === 2) {
            return `
                <div class="quiz-step-header">
                    <h2 class="quiz-step-title">Какие зоны нужно включить в дизайн-проект?</h2>
                    <p class="quiz-step-subtitle">Можно выбрать несколько помещений. Мы сохраним выбор при возврате назад.</p>
                </div>
                <div class="quiz-chip-grid">
                    ${config.zones.map((item) => renderZoneCard(item)).join("")}
                </div>
            `;
        }

        if (step === 3) {
            return `
                <div class="quiz-step-header">
                    <h2 class="quiz-step-title">Укажите примерную площадь помещения</h2>
                    <p class="quiz-step-subtitle">Перемещайте ползунок для выбора площади.</p>
                </div>
                <div class="quiz-area-shell">
                    <div class="quiz-area-value">
                        <div class="quiz-area-badge">${icon("ruler")}</div>
                        <div>
                            <div class="quiz-area-number" data-area-value>${state.area}</div>
                            <span class="quiz-area-unit">м²</span>
                        </div>
                    </div>
                    <div class="quiz-range-wrap">
                        <input
                            class="quiz-range"
                            data-area-range
                            type="range"
                            min="${escapeHtml(String(config.area.min))}"
                            max="${escapeHtml(String(config.area.max))}"
                            step="${escapeHtml(String(config.area.step))}"
                            value="${escapeHtml(String(state.area))}"
                        >
                        <div class="quiz-range-scale">
                            <span>${escapeHtml(String(config.area.min))} м²</span>
                            <span>${escapeHtml(String(config.area.max))} м²</span>
                        </div>
                    </div>
                    <div class="quiz-area-presets">
                        ${renderAreaPreset("Студия", "20–40 м²", 35)}
                        ${renderAreaPreset("Квартира", "40–120 м²", 80)}
                        ${renderAreaPreset("Дом", "120+ м²", 180)}
                    </div>
                </div>
            `;
        }

        if (step === 4) {
            return `
                <div class="quiz-step-header">
                    <h2 class="quiz-step-title">Какой стиль интерьера вам ближе?</h2>
                    <p class="quiz-step-subtitle">Подберите визуальное направление, которое откликается больше всего.</p>
                </div>
                <div class="quiz-style-grid">
                    ${config.styles.map((item) => renderStyleCard(item)).join("")}
                </div>
            `;
        }

        if (step === 5) {
            return `
                <div class="quiz-step-header">
                    <h2 class="quiz-step-title">Какой бюджет на реализацию интерьера вы рассматриваете?</h2>
                    <p class="quiz-step-subtitle">Это поможет предложить реалистичный масштаб проекта уже на первом контакте.</p>
                </div>
                <div class="quiz-budget-list">
                    ${config.budgets.map((item) => renderBudgetOption(item)).join("")}
                </div>
            `;
        }

        return `
            <div class="quiz-step-header">
                <h2 class="quiz-step-title">Оставьте контакты</h2>
                <p class="quiz-step-subtitle">И мы свяжемся с вами по вашему проекту, уже зная вводные по будущему интерьеру.</p>
            </div>
            <div class="quiz-form-layout">
                <div class="quiz-form-panel">
                    <div class="quiz-field">
                        <label for="quiz-name">Ваше имя</label>
                        <input id="quiz-name" class="quiz-input" name="name" type="text" value="${escapeHtml(state.name)}" placeholder="Иван Иванов">
                    </div>
                    <div class="quiz-field">
                        <label for="quiz-phone">Телефон *</label>
                        <input id="quiz-phone" class="quiz-input" name="phone" type="tel" value="${escapeHtml(state.phone)}" placeholder="+7 (___) ___-__-__">
                        ${fieldErrors.phone ? `<div class="quiz-field-error">${escapeHtml(fieldErrors.phone)}</div>` : ""}
                    </div>
                    <div class="quiz-field">
                        <label for="quiz-email">E-mail</label>
                        <input id="quiz-email" class="quiz-input" name="email" type="email" value="${escapeHtml(state.email)}" placeholder="example@mail.ru">
                    </div>
                    <div class="quiz-field">
                        <label for="quiz-comment">Комментарий</label>
                        <textarea id="quiz-comment" class="quiz-textarea" name="comment" placeholder="Нужен дизайн-проект для новой квартиры...">${escapeHtml(state.comment)}</textarea>
                    </div>
                    <div class="quiz-field">
                        <label class="quiz-checkbox ${state.privacy_agreed ? "is-selected" : ""}">
                            <input type="checkbox" name="privacy_agreed" ${state.privacy_agreed ? "checked" : ""} hidden>
                            <span class="quiz-checkbox-box" aria-hidden="true"></span>
                            <span>
                                Я соглашаюсь на обработку персональных данных *
                                ${fieldErrors.privacy ? `<span class="quiz-field-error">${escapeHtml(fieldErrors.privacy)}</span>` : ""}
                            </span>
                        </label>
                    </div>
                </div>
                <aside class="quiz-summary-panel">
                    <h3>Краткое резюме заявки</h3>
                    <div class="quiz-summary-list">
                        ${renderSummaryItem("Тип помещения", state.room_type || "Не выбран")}
                        ${renderSummaryItem("Зоны", state.zones.length ? state.zones.join(", ") : "Не выбраны")}
                        ${renderSummaryItem("Площадь", `${state.area} м²`)}
                        ${renderSummaryItem("Стиль", state.style || "Не выбран")}
                        ${renderSummaryItem("Бюджет", state.budget || "Не выбран")}
                    </div>
                </aside>
            </div>
        `;
    }

    function renderRoomCard(item) {
        const selected = state.room_type === item.value;
        return `
            <button type="button" class="quiz-card-option ${selected ? "is-selected" : ""}" data-room="${escapeHtml(item.value)}">
                <span class="quiz-option-icon">${icon(iconMap[item.label] || "square")}</span>
                ${selected ? `<span class="quiz-option-check">${icon("check")}</span>` : ""}
                <h3 class="quiz-option-title">${escapeHtml(item.label)}</h3>
            </button>
        `;
    }

    function renderZoneCard(item) {
        const selected = state.zones.includes(item.value);
        return `
            <button type="button" class="quiz-chip-option ${selected ? "is-selected" : ""}" data-zone="${escapeHtml(item.value)}">
                <span class="quiz-option-icon">${icon(iconMap[item.label] || "square")}</span>
                <span class="quiz-chip-label">${escapeHtml(item.label)}</span>
                ${selected ? `<span class="quiz-option-check">${icon("check")}</span>` : ""}
            </button>
        `;
    }

    function renderAreaPreset(title, hint, value) {
        return `
            <button type="button" class="quiz-area-preset ${state.area === value ? "is-selected" : ""}" data-area-preset="${value}">
                <strong>${escapeHtml(title)}</strong>
                <span>${escapeHtml(hint)}</span>
            </button>
        `;
    }

    function renderStyleCard(item) {
        const selected = state.style === item.value;
        const theme = styleThemes[item.label] || styleThemes["Пока не определился"];
        const cardDescription = item.description || theme.description;
        const previewImage = Array.isArray(item.style_images) && item.style_images.length ? item.style_images[0] : "";
        return `
            <button type="button" class="quiz-style-card ${selected ? "is-selected" : ""}" data-style="${escapeHtml(item.value)}">
                ${selected ? `<span class="quiz-option-check quiz-style-check">${icon("check")}</span>` : ""}
                <div class="quiz-style-preview ${previewImage ? "has-image" : ""}" style="${previewImage ? "" : `background:${escapeHtml(theme.gradient)}`}">
                    ${previewImage ? `<img class="quiz-style-preview-image" src="${escapeHtml(previewImage)}" alt="${escapeHtml(item.label)}">` : ""}
                    <span>${escapeHtml(theme.title)}</span>
                </div>
                <div class="quiz-style-copy">
                    <h3>${escapeHtml(item.label)}</h3>
                    <p class="quiz-style-description" tabindex="0">
                        <span class="quiz-style-description-text">${escapeHtml(cardDescription)}</span>
                        <span class="quiz-style-description-tooltip" role="tooltip">${escapeHtml(cardDescription)}</span>
                    </p>
                </div>
            </button>
        `;
    }

    function renderBudgetOption(item) {
        const selected = state.budget === item.value;
        return `
            <button type="button" class="quiz-budget-option ${selected ? "is-selected" : ""}" data-budget="${escapeHtml(item.value)}">
                <span class="quiz-option-icon">${icon(iconMap[item.label] || "wallet")}</span>
                <div>
                    <h3 class="quiz-option-title">${escapeHtml(item.label)}</h3>
                </div>
                <span class="quiz-option-check">${icon("check")}</span>
            </button>
        `;
    }

    function renderSummaryItem(label, value) {
        return `
            <div class="quiz-summary-item">
                <strong>${escapeHtml(label)}</strong>
                <span>${escapeHtml(value)}</span>
            </div>
        `;
    }

    function resetQuiz() {
        state = {
            ...defaultState,
            step: 1,
            intro_seen: true,
        };
        fieldErrors = {};
        isSubmitting = false;
        persistState();
        render("forward");
    }

    function trackStepView() {
        if (state.success) {
            return;
        }

        const eventName = state.step === totalSteps ? "quiz_form_view" : `quiz_step_${state.step}`;
        trackEvent(eventName);
    }

    function trackEvent(name) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: name, step: state.step });
        document.dispatchEvent(new CustomEvent("smart-quiz:event", { detail: { name, step: state.step } }));
    }

    function getUtmData() {
        const params = new URLSearchParams(window.location.search);
        const values = {};
        ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
            const value = params.get(key);
            if (value) {
                values[key] = value;
            }
        });
        return values;
    }

    function formatPhone(value) {
        const digits = value.replace(/\D/g, "").slice(0, 11);
        if (!digits) {
            return "";
        }

        const normalized = digits[0] === "7" ? digits : `7${digits.slice(1)}`;
        const part1 = normalized.slice(1, 4);
        const part2 = normalized.slice(4, 7);
        const part3 = normalized.slice(7, 9);
        const part4 = normalized.slice(9, 11);

        let result = "+7";
        if (part1) {
            result += ` (${part1}`;
        }
        if (part1.length === 3) {
            result += ")";
        }
        if (part2) {
            result += ` ${part2}`;
        }
        if (part3) {
            result += `-${part3}`;
        }
        if (part4) {
            result += `-${part4}`;
        }
        return result;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function icon(name) {
        const icons = {
            home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10.5V19h11v-8.5"/><path d="M10 19v-4.5h4V19"/></svg>',
            building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="3.5" width="10" height="17" rx="2"/><path d="M9 7h2M9 10.5h2M9 14h2M15 9h4M15 13h4M15 17h4"/></svg>',
            briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="7" width="17" height="12" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M3.5 12H20.5"/></svg>',
            store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8.5 5.2 5h13.6L20 8.5"/><path d="M5 9h14v10.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5z"/><path d="M9 21v-5h6v5"/></svg>',
            spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3z"/><path d="m18.5 15 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3z"/></svg>',
            more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18" cy="12" r="1.7"/></svg>',
            kitchen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 4v16"/><path d="M10 4v16"/><path d="M10 10H6"/><path d="M15 4v7a2 2 0 1 0 4 0V4"/><path d="M17 13v7"/></svg>',
            sofa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 11V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/><path d="M4 11h16a1 1 0 0 1 1 1v4H3v-4a1 1 0 0 1 1-1Z"/><path d="M5 16v2M19 16v2"/></svg>',
            bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12V7h5a3 3 0 0 1 3 3v2"/><path d="M12 12V9h4a4 4 0 0 1 4 4v3H4v-4Z"/><path d="M4 18v2M20 18v2"/></svg>',
            star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3 2.8 5.6 6.2.9-4.5 4.4 1 6.1L12 17.2 6.5 20l1-6.1L3 9.5l6.2-.9L12 3Z"/></svg>',
            drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4c3 4 5 6.7 5 9a5 5 0 1 1-10 0c0-2.3 2-5 5-9Z"/></svg>',
            door: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3.5h9A1.5 1.5 0 0 1 16.5 5v14A1.5 1.5 0 0 1 15 20.5H6z"/><path d="M6 3.5v17"/><circle cx="12.2" cy="12" r=".8" fill="currentColor"/></svg>',
            desk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="5" width="16" height="9" rx="2"/><path d="M8 14v5M16 14v5M4 19h16"/></svg>',
            wardrobe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M12 3.5v17"/><circle cx="10" cy="12" r=".8" fill="currentColor"/><circle cx="14" cy="12" r=".8" fill="currentColor"/></svg>',
            leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 5c-5 0-11 2.8-11 9a5 5 0 0 0 5 5c6.2 0 7-7.3 6-14Z"/><path d="M8 16c2-1 4.8-3.8 6-7"/></svg>',
            grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
            circle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2.2"/></svg>',
            snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18M5.7 6.7l12.6 10.6M18.3 6.7 5.7 17.3M4 12h16"/></svg>',
            pillar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 5h12M8 5v14M12 5v14M16 5v14M5 19h14"/><path d="M5 8h14"/></svg>',
            diamond: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m7 4 5-1 5 1 3 5-8 11L4 9l3-5Z"/><path d="m7 4 5 16m5-16-5 16"/></svg>',
            question: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.1 2c-.8.7-1.6 1.2-1.6 2.5"/><circle cx="12" cy="17" r=".9" fill="currentColor"/></svg>',
            wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5z"/><path d="M4 9.5h14"/><circle cx="16.5" cy="14" r=".9" fill="currentColor"/></svg>',
            coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="9" cy="8" rx="4.5" ry="2.5"/><path d="M4.5 8v6c0 1.4 2 2.5 4.5 2.5s4.5-1.1 4.5-2.5V8"/><path d="M15 11.5c2.5 0 4.5-1.1 4.5-2.5S17.5 6.5 15 6.5"/></svg>',
            gem: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 9 4-5h8l4 5-8 11L4 9Z"/><path d="m8 4 4 16 4-16"/></svg>',
            crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 18 1.5-10L12 13l6.5-5L20 18H4Z"/><path d="M4 20h16"/></svg>',
            ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 4.5 19.5 10 10 19.5 4.5 14z"/><path d="m11 7 6 6M8.8 9.2l1.4 1.4M6.7 11.3l1.4 1.4M13 5l1.4 1.4"/></svg>',
            check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12.5 4.2 4.2L19 7.5"/></svg>',
            square: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="5" width="14" height="14" rx="3"/></svg>',
        };
        return icons[name] || icons.square;
    }
})();
