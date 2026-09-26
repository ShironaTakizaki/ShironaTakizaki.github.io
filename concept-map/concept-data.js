window.CONCEPT_MAP_DATA = {
  status: "prototype-unverified",
  nodes: [
    {
      id: "cute",
      label: "かわいい",
      type: "core",
      cluster: "cute",
      body: "維持を欲させる容態"
    },
    {
      id: "cool",
      label: "かっこいい",
      type: "core",
      cluster: "cool",
      body: "期待を生じさせる容態"
    },
    {
      id: "beauty",
      label: "美しい",
      type: "core",
      cluster: "beauty",
      body: "連想が完結する容態"
    },
    {
      id: "condition",
      label: "容態",
      type: "related",
      cluster: "shared",
      body: "「かわいい」「かっこいい」「美しい」の三つへ接続する共有構成要素。"
    },
    {
      id: "loss",
      label: "喪失",
      type: "related",
      cluster: "cute",
      body: "維持が意識に上る対比条件の候補。"
    },
    {
      id: "maintenance",
      label: "維持",
      type: "related",
      cluster: "cute",
      body: "時間の前後で、守ると決めた性質が許容範囲にあると扱うこと。"
    },
    {
      id: "expectation",
      label: "期待",
      type: "related",
      cluster: "cool",
      body: "「かっこいい」から「生じさせる」で接続する帰結。"
    },
    {
      id: "completion",
      label: "完結",
      type: "related",
      cluster: "beauty",
      body: "「美しい」から「連想」で接続する帰結。"
    },
    {
      id: "time",
      label: "時間",
      type: "related",
      cluster: "cute",
      body: "「維持」へ「前後を作る」で接続する要素。"
    },
    {
      id: "identity",
      label: "同一性",
      type: "related",
      cluster: "cute",
      body: "「維持」へ「対象をつなぐ」で接続する要素。"
    },
    {
      id: "criterion",
      label: "基準",
      type: "related",
      cluster: "cute",
      body: "「維持」へ「性質を定める」で接続する要素。"
    },
    {
      id: "tolerance",
      label: "許容差",
      type: "related",
      cluster: "cute",
      body: "「維持」へ「変化を認める」で接続する要素。"
    },
    {
      id: "protection",
      label: "保護",
      type: "related",
      cluster: "cute",
      body: "維持から続く関わり方の候補。"
    },
    {
      id: "focus",
      label: "焦点",
      type: "related",
      cluster: "beauty",
      body: "形容が向かう先を絞る構成の候補。"
    },
    {
      id: "purification",
      label: "純化",
      type: "related",
      cluster: "beauty",
      body: "それ以外を想起させない状態へ絞る目的の候補。"
    },
    {
      id: "exclusion",
      label: "排他",
      type: "related",
      cluster: "beauty",
      body: "それ以外を想起から外す作用の候補。"
    }
  ],
  edges: [
    {
      id: "condition-constructs-cute",
      source: "condition",
      target: "cute",
      relation: "構成"
    },
    {
      id: "condition-constructs-cool",
      source: "condition",
      target: "cool",
      relation: "構成"
    },
    {
      id: "condition-constructs-beauty",
      source: "condition",
      target: "beauty",
      relation: "構成"
    },
    {
      id: "time-creates-before-after-for-maintenance",
      source: "time",
      target: "maintenance",
      relation: "前後を作る"
    },
    {
      id: "identity-connects-object-for-maintenance",
      source: "identity",
      target: "maintenance",
      relation: "対象をつなぐ"
    },
    {
      id: "criterion-defines-property-for-maintenance",
      source: "criterion",
      target: "maintenance",
      relation: "性質を定める"
    },
    {
      id: "tolerance-allows-change-for-maintenance",
      source: "tolerance",
      target: "maintenance",
      relation: "変化を認める"
    },
    {
      id: "cute-makes-desire-maintenance",
      source: "cute",
      target: "maintenance",
      relation: "欲させる"
    },
    {
      id: "cool-causes-expectation",
      source: "cool",
      target: "expectation",
      relation: "生じさせる"
    },
    {
      id: "beauty-associates-completion",
      source: "beauty",
      target: "completion",
      relation: "連想"
    },
    {
      id: "loss-maintenance",
      source: "loss",
      target: "maintenance",
      relation: "対比"
    },
    {
      id: "maintenance-protection",
      source: "maintenance",
      target: "protection",
      relation: "導く"
    },
    {
      id: "beauty-focus",
      source: "beauty",
      target: "focus",
      relation: "限定"
    },
    {
      id: "focus-purification",
      source: "focus",
      target: "purification",
      relation: "絞る"
    },
    {
      id: "purification-exclusion",
      source: "purification",
      target: "exclusion",
      relation: "退ける"
    }
  ]
};
