// textAnimator.js

const prepareLineWithSpansAndReturnTargets = (lineElement, text, highlightsConfig) => {
    lineElement.innerHTML = '';
    const segments = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
        let bestMatch = null;

        for (const hl of highlightsConfig) {
            const searchWord = hl.word.toLowerCase();
            const textToSearchIn = text.substring(currentIndex);
            const highlightIndexInSegment = textToSearchIn.toLowerCase().indexOf(searchWord);

            if (highlightIndexInSegment !== -1) {
                const actualHighlightIndex = currentIndex + highlightIndexInSegment;
                const before = actualHighlightIndex === 0 || /\s|,|\.|\?|!|"|'|\(|\)|;|:|^$/.test(text[actualHighlightIndex - 1]);
                const afterIndex = actualHighlightIndex + hl.word.length;
                const after = afterIndex === text.length || /\s|,|\.|\?|!|"|'|\(|\)|;|:|^$/.test(text[afterIndex]);

                if (before && after) {
                    if (!bestMatch || actualHighlightIndex < bestMatch.actualHighlightIndex) {
                        bestMatch = {
                            hlConfig: hl,
                            startIndex: actualHighlightIndex,
                            endIndex: afterIndex,
                            wordContent: text.substring(actualHighlightIndex, afterIndex)
                        };
                    }
                }
            }
        }

        if (bestMatch) {
            if (bestMatch.startIndex > currentIndex) {
                segments.push({ type: 'text', content: text.substring(currentIndex, bestMatch.startIndex) });
            }
            segments.push({ type: 'highlight', content: bestMatch.wordContent, config: bestMatch.hlConfig });
            currentIndex = bestMatch.endIndex;
        } else {
            if (currentIndex < text.length) {
                segments.push({ type: 'text', content: text.substring(currentIndex) });
            }
            break;
        }
    }

    const typingTargets = [];
    segments.forEach(segment => {
        if (segment.type === 'text') {
            const textParts = segment.content.split(/(\s+)/).filter(part => part.length > 0);
            textParts.forEach(part => {
                const span = document.createElement('span');
                if (part.match(/^\s+$/)) {
                    span.innerHTML = part;
                    span.classList.add('text-part', 'space-part');
                    lineElement.appendChild(span);
                } else {
                    span.classList.add('text-part', 'word-part');
                    typingTargets.push({ spanElement: span, textToType: part, isWord: true });
                    lineElement.appendChild(span);
                }
            });
        } else if (segment.type === 'highlight') {
            const span = document.createElement('span');
            span.classList.add(segment.config.class);
            span.dataset.targetColorVar = segment.config.colorVar;
            typingTargets.push({ spanElement: span, textToType: segment.content, isWord: true, isHighlight: true, highlightConfig: segment.config });
            lineElement.appendChild(span);
        }
    });
    return typingTargets;
};

const typeLineByTargets = async (lineElement, typingTargets, typeSpeed, onLineTypedCallback) => {
    let lastWordSpan = null;

    for (const target of typingTargets) {
        const { spanElement, textToType, isWord } = target;
        if (!textToType) continue;

        if (isWord && lastWordSpan) {
            lastWordSpan.classList.remove('typing-active-caret');
        }
        if (isWord) {
            lastWordSpan = spanElement;
            lastWordSpan.classList.add('typing-active-caret');
        }

        for (let i = 0; i < textToType.length; i++) {
            spanElement.textContent += textToType[i];
            await new Promise(resolve => setTimeout(resolve, typeSpeed));
        }
    }
    if (lastWordSpan) {
        lastWordSpan.classList.remove('typing-active-caret');
    }
    if (onLineTypedCallback) {
        await onLineTypedCallback();
    }
};

const triggerHighlightTransition = async (lineElement) => {
    const highlightSpansInLine = lineElement.querySelectorAll('[class^="highlight-"]');
    if (highlightSpansInLine.length > 0) {
        await pause(50);

        highlightSpansInLine.forEach(span => {
            if (span.dataset.targetColorVar) {
                const targetColor = getComputedStyle(document.documentElement).getPropertyValue(span.dataset.targetColorVar).trim();
                if (targetColor) {
                    span.style.color = targetColor;
                }
            }
        });
        await pause(1500);
    }
};

const pause = (duration) => new Promise(resolve => setTimeout(resolve, duration));

export const animateHeroText = async (textContainer, ctaButton) => {
    if (!textContainer) return;
    textContainer.innerHTML = '';
    if (ctaButton) {
        ctaButton.classList.remove('visible');
        ctaButton.style.opacity = '0';
        ctaButton.style.transform = 'translateY(20px)';
    }

    const linesConfig = [
        {
            text: "A sua visão merece destaque.",
            highlights: [
                { word: "sua", class: "highlight-sua", colorVar: "--secondary-color" },
                { word: "visão", class: "highlight-vision", colorVar: "--accent-color" }
            ],
            typeSpeed: 60,
            isFirstLineForSlide: true
        },
        {
            text: "Conectamos sua essência ao mundo.",
            highlights: [
                { word: "sua", class: "highlight-sua", colorVar: "--secondary-color" },
                { word: "essência", class: "highlight-essence", colorVar: "--accent-color" }
            ],
            typeSpeed: 60
        },
        {
            text: "Elevamos sua marca.",
            highlights: [
                { word: "sua", class: "highlight-sua", colorVar: "--secondary-color" },
                { word: "marca", class: "highlight-brand", colorVar: "--accent-color" }
            ],
            typeSpeed: 60
        }
    ];

    const lineElementsData = [];

    for (let i = 0; i < linesConfig.length; i++) {
        const config = linesConfig[i];
        const lineElement = document.createElement('div');
        lineElement.classList.add('animated-text-line');
        textContainer.appendChild(lineElement);
        const typingTargets = prepareLineWithSpansAndReturnTargets(lineElement, config.text, config.highlights);
        lineElementsData.push({ lineElement, typingTargets, originalConfig: config, lineIndex: i });
        await pause(50);
        lineElement.classList.add('visible');
        await pause(100);
    }
    await pause(400);

    for (let i = 0; i < lineElementsData.length; i++) {
        const { lineElement, typingTargets, originalConfig } = lineElementsData[i];
        await typeLineByTargets(lineElement, typingTargets, originalConfig.typeSpeed, null);
        await triggerHighlightTransition(lineElement);
        if (i < lineElementsData.length - 1) {
            await pause(300);
        }
    }

    const allHighlightSpans = Array.from(textContainer.querySelectorAll('[class^="highlight-"]'));
    const initialHighlightDataGlobal = new Map();

    allHighlightSpans.forEach(span => {
        const parentLineDiv = span.closest('.animated-text-line');
        const lineData = lineElementsData.find(ld => ld.lineElement === parentLineDiv);
        const isFirst = lineData ? lineData.originalConfig.isFirstLineForSlide || false : false;
        const rect = span.getBoundingClientRect();
        initialHighlightDataGlobal.set(span, {
            left: rect.left,
            currentTranslateX: 0,
            parentLineElement: parentLineDiv,
            isFirstLineForSlide: isFirst
        });
        span.style.transition = 'none';
        span.style.willChange = 'transform';
    });

    const allTextPartsToFade = textContainer.querySelectorAll('.text-part');

    allTextPartsToFade.forEach(part => {
        part.classList.add('fading-out');
    });

    await pause(500);

    allTextPartsToFade.forEach(part => {
        part.classList.add('hidden');
    });

    allHighlightSpans.forEach(span => {
        const initialData = initialHighlightDataGlobal.get(span);
        if (!initialData) return;
        const currentRect = span.getBoundingClientRect();
        const driftCorrection = initialData.left - currentRect.left;
        const newTranslateX = initialData.currentTranslateX + driftCorrection;
        span.style.transform = `translateX(${newTranslateX}px)`;
        initialData.currentTranslateX = newTranslateX; // Atualiza o translateX acumulado
    });

    await pause(700);

    // --- A partir daqui, a lógica de slide para o centro ---
    const slideAnimationPromises = [];
    const firstLineSlideDuration = 1200;
    const otherLinesSlideDuration = 800;

    // Processar o slide linha por linha para agrupar os destaques
    for (const lineData of lineElementsData) {
        const { lineElement, originalConfig } = lineData;
        // Seleciona apenas spans de destaque que são filhos diretos ou indiretos de lineElement
        const highlightSpansInThisLine = Array.from(lineElement.querySelectorAll('[class^="highlight-"]'));


        if (highlightSpansInThisLine.length > 0) {
            // Obter dados e posições atuais APÓS o congelamento de drift
            // É crucial obter as BoundingClientRects AQUI, após o translateX de correção de drift ter sido aplicado.
            const spansDataWithRects = highlightSpansInThisLine.map(span => {
                const initialData = initialHighlightDataGlobal.get(span);
                return {
                    span,
                    initialData,
                    rect: span.getBoundingClientRect() // Posição visual atual do span
                };
            }).sort((a, b) => a.rect.left - b.rect.left); // Ordenar por posição 'left' para fácil acesso ao primeiro e último

            const firstSpanRect = spansDataWithRects[0].rect;
            const lastSpanRect = spansDataWithRects[spansDataWithRects.length - 1].rect;

            const groupLeft = firstSpanRect.left;
            const groupRight = lastSpanRect.right; // right do último span é a borda direita do grupo
            const groupWidth = groupRight - groupLeft;
            const currentGroupCenterX = groupLeft + groupWidth / 2;

            const lineRect = lineElement.getBoundingClientRect(); // Rect da linha pai
            const targetCenterViewportX = lineRect.left + lineRect.width / 2; // Centro da linha pai
            const movementNeededForGroup = targetCenterViewportX - currentGroupCenterX;

            // Determinar a duração e o delay com base na linha ser a primeira do slide
            let currentSlideDuration = otherLinesSlideDuration;
            let currentSlideDelay = firstLineSlideDuration - otherLinesSlideDuration; // Delay para as outras linhas começarem depois
            if (originalConfig.isFirstLineForSlide) {
                currentSlideDuration = firstLineSlideDuration;
                currentSlideDelay = 0;
            }

            for (const { span, initialData } of spansDataWithRects) {
                if (!initialData) {
                    console.warn("Missing initialData for span:", span);
                    continue;
                }

                // O translateX final é o translateX de "congelamento" + o movimento do grupo
                const finalTranslateX = initialData.currentTranslateX + movementNeededForGroup;

                span.style.transitionProperty = 'transform';
                span.style.transitionDuration = `${currentSlideDuration}ms`;
                span.style.transitionTimingFunction = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
                span.style.transitionDelay = `${currentSlideDelay}ms`;

                requestAnimationFrame(() => {
                    span.style.transform = `translateX(${finalTranslateX}px)`;
                });

                const promise = new Promise(resolve => {
                    let resolved = false;
                    const onTransitionEnd = (event) => {
                        if (!resolved && event.target === span && event.propertyName === 'transform') {
                            resolved = true;
                            span.removeEventListener('transitionend', onTransitionEnd);
                            resolve();
                        }
                    };
                    span.addEventListener('transitionend', onTransitionEnd);
                    setTimeout(() => {
                        if (!resolved) {
                            resolved = true;
                            span.removeEventListener('transitionend', onTransitionEnd);
                            resolve(); // Resolve de qualquer maneira para não bloquear Promise.all
                        }
                    }, currentSlideDuration + currentSlideDelay + 150); // Timeout de segurança um pouco maior
                });
                slideAnimationPromises.push(promise);
            }
        }
    }


    if (slideAnimationPromises.length > 0) {
        await Promise.all(slideAnimationPromises);
    } else {
        await pause(100);
    }

    // Limpar estilos de transição e transform APÓS todas as animações de slide
    allHighlightSpans.forEach(span => {
       span.style.transitionProperty = '';
       span.style.transitionDuration = '';
       span.style.transitionTimingFunction = '';
       span.style.transitionDelay = '';
       span.style.willChange = 'auto';
       span.style.transform = ''; // Importante para resetar a posição e permitir reflow natural
    });

    await pause(300);

    if (ctaButton) {
        ctaButton.style.opacity = '1';
        ctaButton.style.transform = 'translateY(0)';
        ctaButton.classList.add('visible');
    }
};