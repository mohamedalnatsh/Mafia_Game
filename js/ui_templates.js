window.addEventListener("gameappready", () => Object.assign(GameApp, {
  buildEncyclopediaMarkup() {
    return Object.values(ROLES_DATA).map((role) => {
      const localized = this.localizedRole(role.id);
      return `
        <div class="encyclopedia-item">
          <div class="encyclopedia-item-header">
            <strong class="encyclopedia-role-name">${role.icon} ${this.escapeHtml(localized.name)}</strong>
            <span class="role-type-badge team-${role.team}">${this.escapeHtml(this.localizedTeam(role.team))}</span>
          </div>
          <p class="encyclopedia-role-desc">${this.escapeHtml(localized.desc)}</p>
        </div>
      `;
    }).join("");
  },

  buildPresetMarkup() {
    const presetEntries = [
      { id: 6, label: "preset6" },
      { id: 8, label: "preset8" },
      { id: 10, label: "preset10" },
      { id: 12, label: "preset12" },
    ];

    return presetEntries.map(({ id, label }) => `
      <button class="btn btn-secondary preset-button" data-i18n="${label}" data-action="apply-preset" data-preset-id="${id}">
        ${this.escapeHtml(this.t(label))}
      </button>
    `).join("");
  },

  buildVersionAnnouncementMarkup() {
    return `
      <div class="news-section" style="background: rgba(28, 17, 12, 0.72); border-color: rgba(212, 175, 55, 0.5);">
        <h3>🏷️ رقم الإصدار: v3.3 - تحديث عرش المملكة</h3>
      </div>
      <section class="news-section">
        <h3>⚔️ تعديلات وتوازنات الأدوار</h3>
        <ul>
          <li>🕵️‍♂️ <strong>تمويه العرّاب (Godfather):</strong> أصبحت نتائج تحقيق المحقق على العرّاب تُرجع دائماً <strong>"مواطن بريء"</strong> في جميع الجولات.</li>
          <li>🎭 <strong>سرية النسّاخ (Copycat):</strong> تم إلغاء الإعلان العام عند تقمص النسّاخ لدور الفارس الميت، وأصبح الدور المكتسب يظهر في <strong>رسالة سرية خاصة بالنسّاخ فقط</strong>.</li>
        </ul>
      </section>
      <section class="news-section">
        <h3>🏆 نظام الألقاب والمكافآت الجديد</h3>
        <ul>
          <li>🎖️ <strong>أولوية الفوز:</strong> أصبحت الألقاب تُمنح بشكل أساسي لأعضاء <strong>الفريق الفائز</strong> لزيادة حدة المنافسة.</li>
          <li>💰 <strong>مكافأة اللقب (+50 نقطة):</strong> الحصول على أي لقب يمنح اللاعب <strong>+50 نقطة إضافية</strong> لمجموع نقاطه.</li>
          <li>📊 <strong>الاحتساب التراكمي:</strong> أصبحت الألقاب مثل لقب <em>سينشي كودو</em> (كشف 3 أشرار) ولقب <em>الطخيخ</em> (3 قتلات) تُحسب تراكمياً عبر الجولات.</li>
        </ul>
      </section>
      <section class="news-section">
        <h3>⚙️ التخصيص وحفظ الإعدادات</h3>
        <ul>
          <li>💾 <strong>حفظ التفضيلات تلقائياً:</strong> أصبحت جميع خيارات القواعد، المقتنيات، والأحداث تُحفظ في ذاكرة الجهاز (<code>localStorage</code>) ولن تحتاج لإعادة ضبطها مع كل لعبة.</li>
          <li>🛑 <strong>تعطيل الأحداث افتراضياً:</strong> تم ضبط الأحداث والقواعد الخاصة لتكون معطلة افتراضياً للبدء بمرونة.</li>
        </ul>
      </section>
      <section class="news-section">
        <h3>🎨 إصلاح الواجهات والتصميم</h3>
        <ul>
          <li>📑 <strong>تنظيم تبويبات الإعداد:</strong> إرجاع نظام التبويبات الثلاثة (أسماء الفرسان، اختيار الأدوار، القواعد) لتعرض كل قائمة بشكل منفصل عند الضغط عليها.</li>
          <li>⚡ <strong>استقرار التمرير:</strong> معالجة الرعشة البيضاء وتقليل أحمال الرسوميات لتسريع التصفح على الهواتف.</li>
          <li>💅 <strong>تنسيق النصوص والمسافات:</strong> إعادة ضبط أبعاد البطاقات، الأزرار، والخطوط بعد تحويل كافة التنسيقات إلى ملفات CSS.</li>
        </ul>
      </section>
    `;
  },

  buildChangelogMarkup() {
    return this.buildVersionAnnouncementMarkup();
  },

  renderModalTemplates() {
    const encyclopediaList = document.getElementById("encyclopedia-list");
    if (encyclopediaList) {
      encyclopediaList.innerHTML = this.buildEncyclopediaMarkup();
    }

    const presetList = document.getElementById("preset-list");
    if (presetList) {
      presetList.innerHTML = this.buildPresetMarkup();
    }

    const changelogContent = document.getElementById("changelog-content");
    if (changelogContent) {
      changelogContent.innerHTML = this.buildChangelogMarkup();
    }

    const versionContent = document.getElementById("version-announcement-content");
    if (versionContent) {
      versionContent.innerHTML = this.buildVersionAnnouncementMarkup();
    }
  },
}));
