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
      const payload = window.__WHY_DETAILS__;
      if (!payload || !Array.isArray(payload.cases)) {
        throw new Error("why detail data is unavailable");
      }
      const casesById = new Map(payload.cases.map((whyCase) => [whyCase.id, whyCase]));

      document.querySelectorAll("[data-why-case]").forEach((caseElement) => {
        const whyCase = casesById.get(caseElement.dataset.whyCase);
        const overview = caseElement.querySelector("[data-why-overview]");
        const outerDetails = overview?.closest(".case-why");
        if (!whyCase || !overview || !outerDetails) return;

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

        const showOverview = (moveFocus = true) => {
          detailView.hidden = true;
          overview.hidden = false;
          overview.classList.remove("why-view-enter");
          window.requestAnimationFrame(() => overview.classList.add("why-view-enter"));
          if (moveFocus && originatingButton) originatingButton.focus();
        };

        const showDetail = (classification, button) => {
          originatingButton = button;
          detailKicker.textContent = `なぜ？ / ${classification.label}`;
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
          button.addEventListener("click", () => showDetail(classification, button));
          sourceCard.replaceWith(button);
        });

        backButton.addEventListener("click", () => showOverview());
        outerDetails.addEventListener("toggle", () => {
          if (!outerDetails.open && !detailView.hidden) showOverview(false);
        });
        overview.dataset.enhanced = "true";
      });
    } catch (error) {
      console.warn("why details remain in overview mode", error);
    }
  };

  enhanceWhyDetails();

  const form = document.querySelector("[data-step-form]");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll("[data-step]"));
  const review = form.querySelector("[data-review]");
  const reviewTitle = form.querySelector("#review-title");
  const progressWrap = form.querySelector("[data-progress-wrap]");
  const progressText = form.querySelector("[data-progress-text]");
  let currentStep = 0;

  form.addEventListener("submit", (event) => event.preventDefault());

  const focusElement = (element) => {
    if (!element) return;
    window.requestAnimationFrame(() => element.focus());
  };

  const updateProgress = () => {
    const value = String(currentStep + 1);
    progressText.textContent = `${value} / ${steps.length}`;
    progressWrap.dataset.progressValue = value;
  };

  const showStep = (index, moveFocus = true) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    review.hidden = true;
    progressWrap.hidden = false;

    steps.forEach((step, stepIndex) => {
      const active = stepIndex === currentStep;
      step.hidden = !active;
      step.toggleAttribute("data-active", active);
      step.setAttribute("aria-hidden", String(!active));
    });

    updateProgress();
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
    const invalidControl = form.querySelector(":invalid");
    if (!invalidControl) return false;
    const invalidStep = invalidControl.closest("[data-step]");
    showStep(steps.indexOf(invalidStep));
    invalidControl.reportValidity();
    invalidControl.focus();
    return true;
  };

  const populateReview = () => {
    form.querySelectorAll("[data-review-value]").forEach((output) => {
      const control = form.elements.namedItem(output.dataset.reviewValue);
      output.textContent = control ? control.value : "";
    });
  };

  const showReview = () => {
    if (!form.checkValidity()) {
      showFirstInvalidStep();
      return;
    }

    populateReview();
    steps.forEach((step) => {
      step.hidden = true;
      step.removeAttribute("data-active");
      step.setAttribute("aria-hidden", "true");
    });
    progressWrap.hidden = true;
    review.hidden = false;
    focusElement(reviewTitle);
  };

  form.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    switch (button.dataset.action) {
      case "next":
        if (validateCurrent()) showStep(currentStep + 1);
        break;
      case "prev":
        showStep(currentStep - 1);
        break;
      case "review":
        if (validateCurrent()) showReview();
        break;
      case "edit":
        showStep(steps.length - 1);
        break;
      default:
        break;
    }
  });

  progressWrap.hidden = false;
  showStep(0, false);
})();
