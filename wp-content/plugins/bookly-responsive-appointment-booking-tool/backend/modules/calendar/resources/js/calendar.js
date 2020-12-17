jQuery(function ($) {

    let $calendar        = $('.bookly-js-calendar'),
        $staffPills      = $('.bookly-js-staff-pills'),
        $staffLinks      = $('.bookly-js-staff-pills li > a'),
        $staffFilter     = $('#bookly-js-staff-filter'),
        $servicesFilter  = $('#bookly-js-services-filter'),
        $locationsFilter = $('#bookly-js-locations-filter'),
        $gcSyncButton    = $('#bookly-google-calendar-sync'),
        $ocSyncButton    = $('#bookly-outlook-calendar-sync'),
        staffMembers     = [],
        staffIds         = getCookie('bookly_cal_st_ids'),
        serviceIds       = getCookie('bookly_cal_service_ids'),
        locationIds      = getCookie('bookly_cal_location_ids'),
        tabId            = getCookie('bookly_cal_tab_id'),
        lastView         = getCookie('bookly_cal_view'),
        headerToolbar    = {
            start: 'prev,next today',
            center: 'title',
            end: 'dayGridMonth,timeGridWeek,timeGridDay,resourceTimeGridDay,listWeek'
        },
        calendarTimer    = null;

    /**
     * Init tabs.
     */
    // Scrollable pills
    (function () {
        let down = false;
        let dragged = false;
        let scrollLeft = 0;
        let x = 0;
        let el = $staffPills.get(0);
        setTimeout(function() {
            el.scrollLeft = $staffLinks.filter('.active').position().left
        }, 0);
        $staffPills.mousedown(function(e) {
            down = true;
            dragged = false;
            scrollLeft = this.scrollLeft;
            x = e.clientX;
        });
        $staffLinks.on('click', function (e) {
            if (dragged) {
                e.stopImmediatePropagation();
                e.preventDefault();
                dragged = false;
            }
        }).on('dragstart', function () {
            return false;
        });
        $('body').mousemove(function(e) {
            if (down) {
                el.scrollLeft = scrollLeft + x - e.clientX;
                if (Math.abs(scrollLeft - el.scrollLeft) > 2) {
                    dragged = true;
                }
            }
        }).mouseup(function() {
            down = false;
        });
    })();
    $staffLinks.on('click', function (e) {
        e.preventDefault();
        $staffLinks.removeClass('active');
        $(this).addClass('active');
        let staff_id = $(this).data('staff_id');
        setCookie('bookly_cal_tab_id', staff_id);
        if (staff_id == 0) {
            let view = calendar.ec.getOption('view');
            headerToolbar.end = 'dayGridMonth,timeGridWeek,resourceTimeGridDay,listWeek';
            calendar.ec
                .setOption('headerToolbar', headerToolbar)
                .setOption('view', view === 'timeGridDay' ? 'resourceTimeGridDay' : view)
                .refetchEvents()
            ;
        } else {
            let view = calendar.ec.getOption('view');
            headerToolbar.end = 'dayGridMonth,timeGridWeek,timeGridDay,listWeek';
            calendar.ec
                .setOption('headerToolbar', headerToolbar)
                .setOption('view', view === 'resourceTimeGridDay' ? 'timeGridDay' : view)
                .refetchEvents()
            ;
        }
    });
    $staffLinks.filter('[data-staff_id=' + tabId + ']').addClass('active');
    if ($staffLinks.filter('.active').length === 0) {
        $staffLinks.eq(0).addClass('active').parent().show();
    }

    /**
     * Init staff filter.
     */
    $staffFilter.booklyDropdown({
        onChange: function (values, selected, all) {
            let ids = [];
            staffMembers = [];
            this.booklyDropdown('getSelectedExt').forEach(function (item) {
                ids.push(item.value);
                staffMembers.push({id: item.value, title: encodeHTML(item.name)});
            });
            calendar.ec.setOption('resources', staffMembers);
            setCookie('bookly_cal_st_ids', ids);
            if (all) {
                $staffLinks.filter('[data-staff_id!=0]').parent().toggle(selected);
            } else {
                values.forEach(function (value) {
                    $staffLinks.filter('[data-staff_id=' + value + ']').parent().toggle(selected);
                });
            }
            if ($staffLinks.filter(':visible.active').length === 0) {
                $staffLinks.filter(':visible:first').triggerHandler('click');
            } else if ($staffLinks.filter('.active').data('staff_id') === 0) {
                calendar.ec.refetchEvents();
            }
        }
    });
    if (staffIds === null) {
        $staffFilter.booklyDropdown('selectAll');
    } else if (staffIds !== '') {
        $staffFilter.booklyDropdown('setSelected', staffIds.split(','));
    } else {
        $staffFilter.booklyDropdown('toggle');
    }
    // Populate staffMembers.
    $staffFilter.booklyDropdown('getSelectedExt').forEach(function (item) {
        staffMembers.push({id: item.value, title: encodeHTML(item.name)});
        $staffLinks.filter('[data-staff_id=' + item.value + ']').parent().show();
    });

    /**
     * Init services filter.
     */
    $servicesFilter.booklyDropdown({
        onChange: function (values, selected, all) {
            serviceIds = this.booklyDropdown('getSelected');
            setCookie('bookly_cal_service_ids', serviceIds);
            calendar.ec.refetchEvents();
        }
    });
    if (serviceIds === null) {
        $servicesFilter.booklyDropdown('selectAll');
    } else if (serviceIds !== '') {
        $servicesFilter.booklyDropdown('setSelected', serviceIds.split(','));
    } else {
        $servicesFilter.booklyDropdown('toggle');
    }
    // Populate serviceIds.
    serviceIds = $servicesFilter.booklyDropdown('getSelected');

    /**
     * Init locations filter.
     */
    $locationsFilter.booklyDropdown({
        onChange: function (values, selected, all) {
            locationIds = this.booklyDropdown('getSelected');
            setCookie('bookly_cal_location_ids', locationIds);
            calendar.ec.refetchEvents();
        }
    });
    if (locationIds === null) {
        $locationsFilter.booklyDropdown('selectAll');
    } else if (locationIds !== '') {
        $locationsFilter.booklyDropdown('setSelected', locationIds.split(','));
    } else {
        $locationsFilter.booklyDropdown('toggle');
    }
    // Populate locationIds.
    locationIds = $locationsFilter.booklyDropdown('getSelected');

    /**
     * Init calendar refresh buttons.
     */
    function refreshBooklyCalendar() {
        let $refresh = $('input[name="bookly_calendar_refresh_rate"]:checked');
        clearTimeout(calendarTimer);
        if ($refresh.val() > 0) {
            calendarTimer = setTimeout(function () {
                calendar.ec.refetchEvents();
            }, $refresh.val() * 1000)
        }
    }

    function encodeHTML(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    $('#bookly-calendar-refresh').on('click', function () {
        calendar.ec.refetchEvents();
    });

    $('input[name="bookly_calendar_refresh_rate"]').change(function () {
        $.post(
            ajaxurl,
            {action: 'bookly_update_calendar_refresh_rate', csrf_token: BooklyL10n.csrf_token, rate: this.value},
            function (response) {},
            'json'
        );
        if (this.value > 0) {
            $(this).closest('.btn-group').find('button').addClass('btn-success').removeClass('btn-default');
        } else {
            $(this).closest('.btn-group').find('button').addClass('btn-default').removeClass('btn-success');
        }
        refreshBooklyCalendar();
    });

    refreshBooklyCalendar();

    // View buttons
    if ($staffLinks.filter('.active').data('staff_id') == 0) {
        headerToolbar.end = 'dayGridMonth,timeGridWeek,resourceTimeGridDay,listWeek';
        if (headerToolbar.end.indexOf(lastView) === -1) {
            lastView = 'resourceTimeGridDay';
        }
    } else {
        headerToolbar.end = 'dayGridMonth,timeGridWeek,timeGridDay,listWeek';
        if (headerToolbar.end.indexOf(lastView) === -1) {
            lastView = 'timeGridDay';
        }
    }

    /**
     * Init Calendar.
     */
    let calendar = new BooklyCalendar($calendar, {
        calendar: {
            // General Display.
            headerToolbar: headerToolbar,
            height: heightEC(),
            // Views.
            view: lastView,
            views: {
                resourceTimeGridDay: {
                    resources: staffMembers,
                    filterResourcesWithEvents: BooklyL10n.filterStaffWithEvents,
                    titleFormat: {year: 'numeric', month: 'short', day: 'numeric', weekday: 'short'}
                }
            }
        },
        getCurrentStaffId: function () {
            return $staffLinks.filter('.active').data('staff_id');
        },
        getStaffMemberIds: function () {
            let ids = [],
                staffId = this.getCurrentStaffId()
            ;

            if (staffId == 0) {
                staffMembers.forEach(function (staff) {
                    ids.push(staff.id);
                });
            } else {
                ids.push(staffId);
            }

            return ids;
        },
        getLocationIds: function () {
            return locationIds;
        },
        getServiceIds: function () {
            return serviceIds;
        },
        refresh: refreshBooklyCalendar,
        viewChanged: function (view) {
            setCookie('bookly_cal_view', view.type);
        },
        l10n: BooklyL10n
    });

    function heightEC() {
        let height = $(window).height() - $calendar.offset().top - 20;

        return (height > 620 ? height : 620) + 'px';
    }

    $(window).on('resize', function () {
        calendar.ec.setOption('height', heightEC());
    });

    /**
     * Set cookie.
     *
     * @param key
     * @param value
     */
    function setCookie(key, value) {
        var expires = new Date();
        expires.setTime(expires.getTime() + 86400000); // 60 × 60 × 24 × 1000
        document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
    }

    /**
     * Get cookie.
     *
     * @param key
     * @return {*}
     */
    function getCookie(key) {
        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue ? keyValue[2] : null;
    }

    /**
     * Sync with Google Calendar.
     */
    $gcSyncButton.on('click', function () {
        var ladda = Ladda.create(this);
        ladda.start();
        $.post(
            ajaxurl,
            {action: 'bookly_advanced_google_calendar_sync', csrf_token: BooklyL10n.csrf_token},
            function (response) {
                if (response.success) {
                    calendar.ec.refetchEvents();
                }
                booklyAlert(response.data.alert);
                ladda.stop();
            },
            'json'
        );
    });

    /**
     * Sync with Outlook Calendar.
     */
    $ocSyncButton.on('click', function () {
        var ladda = Ladda.create(this);
        ladda.start();
        $.post(
            ajaxurl,
            {action: 'bookly_outlook_calendar_sync', csrf_token: BooklyL10n.csrf_token},
            function (response) {
                if (response.success) {
                    calendar.ec.refetchEvents();
                }
                booklyAlert(response.data.alert);
                ladda.stop();
            },
            'json'
        );
    });
});