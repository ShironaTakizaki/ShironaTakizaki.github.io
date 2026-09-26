(() => {
  "use strict";

  const mapElement = document.querySelector("#concept-map");
  const data = window.CONCEPT_MAP_DATA;

  if (!mapElement || !data || !window.d3) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const nodes = data.nodes.map((node) => ({ ...node }));
  const links = data.edges.map((edge, index) => ({ ...edge, curve: index % 2 === 0 ? 22 : -22 }));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  let selectedId = null;
  let previousRandomId = null;
  let centeringId = null;
  let centeringTimer = null;
  let width = 0;
  let height = 0;

  const svg = d3.select(".edge-layer");
  const nodeLayer = d3.select(".node-layer");
  const edgeLayer = svg.select(".edges");

  const detailKind = document.querySelector("#detail-kind");
  const detailHeading = document.querySelector("#detail-heading");
  const detailBody = document.querySelector("#detail-body");
  const detailRelations = document.querySelector("#detail-relations");
  const incomingGroup = document.querySelector("#incoming-group");
  const outgoingGroup = document.querySelector("#outgoing-group");
  const incomingList = document.querySelector("#incoming-list");
  const outgoingList = document.querySelector("#outgoing-list");
  const randomButton = document.querySelector("#random-concept");
  const resetButton = document.querySelector("#reset-view");

  const edgeSelection = edgeLayer
    .selectAll("path")
    .data(links, (edge) => edge.id)
    .join("path")
    .attr("class", "edge")
    .attr("data-edge-id", (edge) => edge.id);

  const nodeSelection = nodeLayer
    .selectAll("button")
    .data(nodes, (node) => node.id)
    .join("button")
    .attr("type", "button")
    .attr("class", "concept-card")
    .attr("data-node-id", (node) => node.id)
    .attr("data-type", (node) => node.type)
    .attr("aria-pressed", "false")
    .text((node) => node.label)
    .on("pointerenter", (event, node) => {
      node.pointerOver = true;
      pinNode(node);
    })
    .on("pointerleave", (event, node) => {
      node.pointerOver = false;
      releaseNodeWhenPossible(node);
    })
    .on("focus", (event, node) => {
      node.keyboardFocus = true;
      pinNode(node);
    })
    .on("blur", (event, node) => {
      node.keyboardFocus = false;
      releaseNodeWhenPossible(node);
    })
    .on("click", (event, node) => {
      if (node.wasDragged) {
        node.wasDragged = false;
        return;
      }
      selectNode(node.id);
    });

  nodeSelection.call(
    d3.drag()
      .on("start", (event, node) => {
        node.wasDragged = false;
        cancelCentering();
        pinNode(node, true);
        if (!prefersReducedMotion.matches) {
          simulation.alphaTarget(0.12).restart();
        }
      })
      .on("drag", (event, node) => {
        node.wasDragged = true;
        node.fx = clamp(event.x, nodeRadius(node), width - nodeRadius(node));
        node.fy = clamp(event.y, nodeRadius(node), height - nodeRadius(node));
        if (prefersReducedMotion.matches) {
          render();
        }
      })
      .on("end", (event, node) => {
        if (!prefersReducedMotion.matches) {
          simulation.alphaTarget(0);
        }
        releaseNodeWhenPossible(node);
      })
  );

  const chargeForce = d3.forceManyBody()
    .strength(chargeStrength)
    .distanceMax(440);
  const collisionForce = d3.forceCollide()
    .radius(collisionRadius)
    .strength(0.9)
    .iterations(2);

  const simulation = d3.forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links)
        .id((node) => node.id)
        .distance(166)
        .strength(0.45)
    )
    .force("charge", chargeForce)
    .force("collision", collisionForce)
    .on("tick", render);

  function nodeRadius(node) {
    const compact = width < 520;
    if (node.type === "core") {
      return compact ? 66 : 82;
    }
    return compact ? 52 : 64;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function isProtectedNode(node) {
    return node.type === "core" || node.id === selectedId;
  }

  function chargeStrength(node) {
    return isProtectedNode(node) ? -760 : -90;
  }

  function collisionRadius(node) {
    return isProtectedNode(node) ? nodeRadius(node) + 20 : 16;
  }

  function refreshPhysicalRoles() {
    chargeForce.strength(chargeStrength);
    collisionForce.radius(collisionRadius);
  }

  function setForces() {
    const compact = width < 680;
    const verticalCenter = compact ? height * 0.62 : height * 0.58;
    const cuteX = compact ? width * 0.28 : width * 0.3;
    const coolX = compact ? width * 0.52 : width * 0.52;
    const beautyX = compact ? width * 0.74 : width * 0.75;

    simulation
      .force("x", d3.forceX((node) => {
        if (node.id === centeringId) {
          return width * 0.5;
        }
        if (node.cluster === "cute") {
          return cuteX;
        }
        if (node.cluster === "beauty") {
          return beautyX;
        }
        if (node.cluster === "cool") {
          return coolX;
        }
        return width * 0.54;
      }).strength((node) => node.id === centeringId ? 0.58 : 0.055))
      .force("y", d3.forceY((node) => node.id === centeringId ? height * 0.58 : verticalCenter)
        .strength((node) => node.id === centeringId ? 0.58 : 0.045));
  }

  function render() {
    const topSafeArea = width < 680 ? 168 : 210;
    const bottomSafeArea = 76;

    nodes.forEach((node) => {
      const radius = nodeRadius(node);
      node.x = clamp(node.x || width / 2, radius + 8, width - radius - 8);
      node.y = clamp(node.y || height / 2, topSafeArea + radius, height - bottomSafeArea - radius);
    });

    nodeSelection
      .style("left", (node) => `${node.x}px`)
      .style("top", (node) => `${node.y}px`);

    edgeSelection.attr("d", (edge) => curvedPath(edge));
  }

  function edgePoints(edge) {
    const source = edge.source;
    const target = edge.target;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / distance;
    const uy = dy / distance;
    const sourceRadius = nodeRadius(source) * 0.76;
    const targetRadius = nodeRadius(target) * 0.82;
    const start = { x: source.x + ux * sourceRadius, y: source.y + uy * sourceRadius };
    const end = { x: target.x - ux * targetRadius, y: target.y - uy * targetRadius };
    const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    const normal = { x: -uy, y: ux };
    const control = {
      x: midpoint.x + normal.x * edge.curve,
      y: midpoint.y + normal.y * edge.curve
    };
    return { start, end, control };
  }

  function curvedPath(edge) {
    const { start, end, control } = edgePoints(edge);
    return `M${start.x},${start.y} Q${control.x},${control.y} ${end.x},${end.y}`;
  }

  function endpointId(endpoint) {
    return typeof endpoint === "string" ? endpoint : endpoint.id;
  }

  function isRelatedEdge(edge, id) {
    return endpointId(edge.source) === id || endpointId(edge.target) === id;
  }

  function isRelatedNode(node, id) {
    if (node.id === id) {
      return true;
    }
    return links.some((edge) => {
      if (!isRelatedEdge(edge, id)) {
        return false;
      }
      return endpointId(edge.source) === node.id || endpointId(edge.target) === node.id;
    });
  }

  function selectNode(id) {
    const selected = nodeById.get(id);
    if (!selected) {
      return;
    }

    const previouslySelected = selectedId ? nodeById.get(selectedId) : null;
    selectedId = id;
    refreshPhysicalRoles();
    if (previouslySelected && previouslySelected.id !== id) {
      releaseNodeWhenPossible(previouslySelected);
    }
    pinNode(selected);
    centerSelectedNode(selected);
    mapElement.dataset.focused = "true";

    nodeSelection
      .attr("data-selected", (node) => String(node.id === id))
      .attr("data-related", (node) => String(isRelatedNode(node, id)))
      .attr("aria-pressed", (node) => String(node.id === id));

    edgeSelection.attr("data-related", (edge) => String(isRelatedEdge(edge, id)));

    updateDetail(selected);
  }

  function updateDetail(node) {
    const kindLabel = node.type === "core" ? "中心概念" : "周辺概念";
    const incoming = links.filter((edge) => endpointId(edge.target) === node.id);
    const outgoing = links.filter((edge) => endpointId(edge.source) === node.id);

    detailKind.textContent = kindLabel;
    detailHeading.textContent = node.label;
    detailBody.textContent = node.body;
    detailRelations.hidden = incoming.length === 0 && outgoing.length === 0;

    fillRelationList(incomingList, incoming);
    fillRelationList(outgoingList, outgoing);
    incomingGroup.hidden = incoming.length === 0;
    outgoingGroup.hidden = outgoing.length === 0;
  }

  function fillRelationList(list, relationLinks) {
    list.replaceChildren();
    relationLinks.forEach((edge) => {
      const source = nodeById.get(endpointId(edge.source));
      const target = nodeById.get(endpointId(edge.target));
      const item = document.createElement("li");
      item.textContent = `${source.label} → ${edge.relation} → ${target.label}`;
      list.append(item);
    });
  }

  function resetView() {
    cancelCentering();
    selectedId = null;
    refreshPhysicalRoles();
    mapElement.dataset.focused = "false";
    nodeSelection
      .attr("data-selected", "false")
      .attr("data-related", "true")
      .attr("aria-pressed", "false");
    edgeSelection.attr("data-related", "true");

    detailKind.textContent = "地図の読み方";
    detailHeading.textContent = "概念を一つ選ぶ";
    detailBody.textContent = "全体では関係の広がりを、選択後は一本ずつの向きと意味を確認できます。";
    detailRelations.hidden = true;
    nodes.forEach(releaseNodeWhenPossible);
  }

  function pinNode(node, force = false) {
    if (node.id === centeringId && !force) {
      return;
    }
    node.fx = node.x;
    node.fy = node.y;
    nodeSelection
      .filter((candidate) => candidate.id === node.id)
      .attr("data-pinned", "true");
  }

  function releaseNodeWhenPossible(node) {
    const mustRemainPinned = node.id === selectedId || node.pointerOver || node.keyboardFocus;
    if (mustRemainPinned) {
      return;
    }
    node.fx = null;
    node.fy = null;
    nodeSelection
      .filter((candidate) => candidate.id === node.id)
      .attr("data-pinned", "false");
  }

  function centerSelectedNode(node) {
    cancelCentering();
    centeringId = node.id;
    node.fx = null;
    node.fy = null;
    nodeSelection
      .filter((candidate) => candidate.id === node.id)
      .attr("data-pinned", "false");
    setForces();

    if (prefersReducedMotion.matches) {
      settleLayout(0.9, 120);
      finishCentering(node);
      return;
    }

    simulation.alphaTarget(0).alpha(0.88).restart();
    centeringTimer = window.setTimeout(() => finishCentering(node), 900);
  }

  function finishCentering(node) {
    if (centeringId !== node.id) {
      return;
    }
    if (centeringTimer !== null) {
      window.clearTimeout(centeringTimer);
      centeringTimer = null;
    }
    const targetX = width * 0.5;
    const targetY = height * 0.58;
    node.x = targetX;
    node.y = targetY;
    node.fx = targetX;
    node.fy = targetY;
    centeringId = null;
    nodeSelection
      .filter((candidate) => candidate.id === node.id)
      .attr("data-pinned", "true");
    setForces();
    if (!prefersReducedMotion.matches) {
      simulation.alpha(0.28).restart();
    }
    render();
  }

  function cancelCentering() {
    if (centeringTimer !== null) {
      window.clearTimeout(centeringTimer);
      centeringTimer = null;
    }
    if (!centeringId) {
      return;
    }
    const centeringNode = nodeById.get(centeringId);
    centeringId = null;
    setForces();
    if (centeringNode) {
      releaseNodeWhenPossible(centeringNode);
    }
  }

  function selectRandomNode() {
    const candidates = nodes.filter((node) => node.id !== selectedId && node.id !== previousRandomId);
    const pool = candidates.length > 0 ? candidates : nodes;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    previousRandomId = selected.id;
    selectNode(selected.id);
    const button = document.querySelector(`[data-node-id="${selected.id}"]`);
    button?.focus({ preventScroll: true });
  }

  function settleLayout(alpha, iterations = 90) {
    simulation.stop();
    simulation.alpha(alpha);
    for (let index = 0; index < iterations; index += 1) {
      simulation.tick();
    }
    simulation.stop();
    render();
  }

  function startLayout(alpha) {
    if (prefersReducedMotion.matches) {
      settleLayout(alpha, 100);
      return;
    }
    simulation.alpha(alpha).restart();
  }

  function resizeMap() {
    const bounds = mapElement.getBoundingClientRect();
    width = Math.max(320, bounds.width);
    height = Math.max(500, bounds.height);
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    setForces();
    startLayout(0.88);
    if (selectedId) {
      centerSelectedNode(nodeById.get(selectedId));
    }
  }

  randomButton?.addEventListener("click", selectRandomNode);
  resetButton?.addEventListener("click", resetView);
  prefersReducedMotion.addEventListener("change", () => startLayout(0.7));

  const resizeObserver = new ResizeObserver(resizeMap);
  resizeObserver.observe(mapElement);
  resizeMap();
})();
