(() => {
  document.documentElement.classList.add("js");

  const createTextElement = (tagName, className, textContent) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = textContent;
    return element;
  };

  const enhanceWhyDetails = () => {
    try {
      const payload = window.__PAGE_QA_CASES__;
      if (!payload || !Array.isArray(payload.cases)) {
        throw new Error("why detail data is unavailable");
      }
      const casesById = new Map(payload.cases.map((whyCase) => [whyCase.id, whyCase]));

      document.querySelectorAll("[data-why-case]").forEach((caseElement) => {
        const whyCase = casesById.get(caseElement.dataset.whyCase);
        const overview = caseElement.querySelector("[data-why-overview]");
        const outerDetails = overview?.closest(".case-explanation");
        if (!whyCase || !overview || !outerDetails) return;

        const isGuidedCase = caseElement.dataset.whyCase === "page-qa-case-1";
        const attentionClass = "attention-wave";
        let caseAcknowledged = outerDetails.open;
        let situationAcknowledged = false;
        let situationButton = null;

        const detailView = document.createElement("section");
        detailView.className = "why-detail-view";
        detailView.hidden = true;
        detailView.setAttribute("aria-live", "polite");

        const backButton = createTextElement("button", "why-back", "← 四分類へ戻る");
        backButton.type = "button";

        const detailHeading = document.createElement("div");
        detailHeading.className = "why-detail-heading";
        const detailKicker = createTextElement("p", "why-detail-kicker", "");
        const detailTitle = createTextElement("h4", "why-detail-title", "");
        const detailSummary = createTextElement("p", "why-detail-summary", "");
        detailHeading.append(detailKicker, detailTitle, detailSummary);

        const detailList = document.createElement("div");
        detailList.className = "why-detail-list";
        detailView.append(backButton, detailHeading, detailList);
        overview.after(detailView);

        let originatingButton = null;

        const syncAttentionGuide = () => {
          if (!isGuidedCase) return;
          caseElement.classList.toggle(attentionClass, !caseAcknowledged);
          if (situationButton) {
            situationButton.classList.toggle(
              attentionClass,
              caseAcknowledged && !situationAcknowledged,
            );
          }
        };

        const showOverview = (moveFocus = true) => {
          detailView.hidden = true;
          overview.hidden = false;
          overview.classList.remove("why-view-enter");
          window.requestAnimationFrame(() => overview.classList.add("why-view-enter"));
          if (moveFocus && originatingButton) originatingButton.focus();
        };

        const showDetail = (classification, button) => {
          originatingButton = button;
          detailKicker.textContent = `詳しく / ${classification.label}`;
          detailTitle.textContent = classification.label;
          detailSummary.textContent = classification.closedSummary;
          detailList.replaceChildren();

          classification.openDetails.forEach((detail) => {
            const item = document.createElement("article");
            item.className = "why-detail-item";
            item.append(
              createTextElement("h5", "", detail.role),
              createTextElement("p", "", detail.summary),
            );
            detailList.append(item);
          });

          overview.hidden = true;
          detailView.hidden = false;
          detailView.classList.remove("why-view-enter");
          window.requestAnimationFrame(() => detailView.classList.add("why-view-enter"));
          backButton.focus();
        };

        const sourceCards = Array.from(overview.querySelectorAll("section"));
        whyCase.classifications.forEach((classification, index) => {
          const sourceCard = sourceCards[index];
          if (!sourceCard) return;

          const button = document.createElement("button");
          button.type = "button";
          button.className = "why-category";
          button.dataset.whyKey = classification.key;
          button.setAttribute("aria-label", `${classification.label}の詳細を見る`);
          button.append(
            createTextElement("h4", "", classification.label),
            createTextElement("p", "", classification.closedSummary),
            createTextElement("span", "why-category-action", "詳細を見る →"),
          );
          if (isGuidedCase && classification.key === "situation") {
            situationButton = button;
          }
          button.addEventListener("click", () => {
            if (button === situationButton) {
              situationAcknowledged = true;
              syncAttentionGuide();
            }
            showDetail(classification, button);
          });
          sourceCard.replaceWith(button);
        });

        backButton.addEventListener("click", () => showOverview());
        outerDetails.addEventListener("toggle", () => {
          if (isGuidedCase && outerDetails.open && !caseAcknowledged) {
            caseAcknowledged = true;
            syncAttentionGuide();
          }
          if (!outerDetails.open && !detailView.hidden) showOverview(false);
        });
        syncAttentionGuide();
        overview.dataset.enhanced = "true";
      });
    } catch (error) {
      console.warn("why details remain in overview mode", error);
    }
  };

  enhanceWhyDetails();

  const enhanceMethodMotion = () => {
    const motions = Array.from(document.querySelectorAll("[data-method-motion]"));
    if (!motions.length) return;

    if (!("IntersectionObserver" in window)) {
      motions.forEach((motion) => motion.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.42 },
    );

    motions.forEach((motion) => observer.observe(motion));
  };

  enhanceMethodMotion();

  const form = document.querySelector("[data-step-form]");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll("[data-step]"));
  const pathStep = form.querySelector("[data-path-step]");
  const contactStep = form.querySelector("[data-contact-step]");
  const contactControl = form.elements.namedItem("contact");
  const selfResolution = form.querySelector("[data-self-resolution]");
  const selfResolutionTitle = form.querySelector("#self-resolution-title");
  const selfFinish = form.querySelector("[data-self-finish]");
  const shareMessage = form.querySelector("[data-share-message]");
  const shareCount = form.querySelector("[data-share-count]");
  const shareLink = form.querySelector("[data-share-link]");
  const review = form.querySelector("[data-review]");
  const reviewTitle = form.querySelector("#review-title");
  const progressWrap = form.querySelector("[data-progress-wrap]");
  const progressText = form.querySelector("[data-progress-text]");
  const fieldCounts = Array.from(form.querySelectorAll("[data-field-count]"));
  const publicPageUrl = "https://shironatakizaki.github.io/";
  const xIntentUrl = "https://x.com/intent/tweet";
  let currentStep = 0;

  form.addEventListener("submit", (event) => event.preventDefault());

  fieldCounts.forEach((output) => {
    const control = form.elements.namedItem(output.dataset.fieldCount);
    if (!control) return;
    const updateFieldCount = () => {
      output.textContent = String(control.value.length);
    };
    control.addEventListener("input", updateFieldCount);
    updateFieldCount();
  });

  const focusElement = (element) => {
    if (!element) return;
    window.requestAnimationFrame(() => element.focus());
  };

  const updateQuestionProgress = () => {
    const value = String(currentStep + 1);
    progressText.textContent = `${value} / ${steps.length}`;
    progressWrap.dataset.progressValue = value;
  };

  const hideAllViews = () => {
    steps.forEach((step) => {
      step.hidden = true;
      step.removeAttribute("data-active");
      step.setAttribute("aria-hidden", "true");
    });
    pathStep.hidden = true;
    contactStep.hidden = true;
    selfResolution.hidden = true;
    review.hidden = true;
  };

  const showStep = (index, moveFocus = true) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    contactControl.required = false;
    hideAllViews();
    progressWrap.hidden = false;

    steps.forEach((step, stepIndex) => {
      const active = stepIndex === currentStep;
      step.hidden = !active;
      step.toggleAttribute("data-active", active);
      step.setAttribute("aria-hidden", String(!active));
    });

    updateQuestionProgress();
    if (moveFocus) focusElement(steps[currentStep].querySelector("textarea, input"));
  };

  const currentControl = () => steps[currentStep].querySelector("textarea, input");

  const validateCurrent = () => {
    const control = currentControl();
    if (!control || control.checkValidity()) return true;
    control.reportValidity();
    control.focus();
    return false;
  };

  const showFirstInvalidStep = () => {
    const invalidControl = steps
      .map((step) => step.querySelector(":invalid"))
      .find(Boolean);
    if (!invalidControl) return false;
    const invalidStep = invalidControl.closest("[data-step]");
    showStep(steps.indexOf(invalidStep));
    invalidControl.reportValidity();
    invalidControl.focus();
    return true;
  };

  const showPathStep = () => {
    contactControl.required = false;
    hideAllViews();
    pathStep.hidden = false;
    progressWrap.hidden = false;
    progressText.textContent = "回答後の選択";
    progressWrap.dataset.progressValue = String(steps.length);
    focusElement(pathStep.querySelector("legend"));
  };

  const showContactStep = () => {
    contactControl.required = true;
    hideAllViews();
    contactStep.hidden = false;
    progressWrap.hidden = false;
    progressText.textContent = "返信先";
    progressWrap.dataset.progressValue = String(steps.length);
    focusElement(contactControl);
  };

  const updateShareHref = () => {
    const message = shareMessage.value.trim();
    shareCount.textContent = String(shareMessage.value.length);
    const params = new URLSearchParams({ url: publicPageUrl });
    if (message) params.set("text", message);
    shareLink.href = `${xIntentUrl}?${params.toString()}`;
  };

  const showSelfResolution = () => {
    contactControl.required = false;
    hideAllViews();
    progressWrap.hidden = true;
    selfResolution.hidden = false;
    selfFinish.hidden = true;
    updateShareHref();
    focusElement(selfResolutionTitle);
  };

  const populateReview = () => {
    form.querySelectorAll("[data-review-value]").forEach((output) => {
      const control = form.elements.namedItem(output.dataset.reviewValue);
      output.textContent = control ? control.value : "";
    });
  };

  const showReview = () => {
    if (!contactControl.checkValidity()) {
      contactControl.reportValidity();
      contactControl.focus();
      return;
    }
    if (showFirstInvalidStep()) return;

    populateReview();
    hideAllViews();
    progressWrap.hidden = true;
    review.hidden = false;
    focusElement(reviewTitle);
  };

  shareMessage.addEventListener("input", updateShareHref);

  form.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    switch (button.dataset.action) {
      case "next":
        if (!validateCurrent()) break;
        if (currentStep === steps.length - 1) showPathStep();
        else showStep(currentStep + 1);
        break;
      case "prev":
        showStep(currentStep - 1);
        break;
      case "back-to-questions":
        showStep(steps.length - 1);
        break;
      case "back-to-path":
        showPathStep();
        break;
      case "choose-continue":
        showContactStep();
        break;
      case "choose-self":
        showSelfResolution();
        break;
      case "review":
        showReview();
        break;
      case "edit":
        showContactStep();
        break;
      case "finish-self":
        selfFinish.hidden = false;
        focusElement(selfFinish);
        break;
      default:
        break;
    }
  });

  progressWrap.hidden = false;
  updateShareHref();
  showStep(0, false);
})();
