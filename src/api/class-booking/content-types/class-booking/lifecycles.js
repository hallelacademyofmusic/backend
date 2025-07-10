// Track sent emails to prevent duplicates
const sentEmails = new Set();

// Helper function to create Google Maps link
function createGoogleMapsLink(location) {
  if (!location) return null;
  const encodedLocation = encodeURIComponent(location);
  return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
}

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    
    console.log('afterCreate triggered for booking:', result.id);
    
    try {
      // Fetch the complete booking with populated relations
      /** @type {any} */
      const booking = await strapi.entityService.findOne('api::class-booking.class-booking', result.id, {
        populate: ['instructor', 'student']
      });

      // Get the document ID - Method 1 works well, so use it as primary
      let documentId = result.documentId || result.id;
      console.log('Document ID retrieved:', documentId);

      console.log('Create - Booking id:', booking.id, 'Document ID:', documentId, 'Status:', booking.bookingStatus);
      console.log('Create - Instructor:', booking.instructor ? `${booking.instructor.firstName} ${booking.instructor.lastName} (${booking.instructor.email})` : 'No instructor');
      console.log('Create - Student:', booking.student ? `${booking.student.firstName} ${booking.student.lastName} (${booking.student.email})` : 'No student');

      // Send email to instructor about new booking (only if not already sent and has document_id)
      const emailSentKey = `creation_${booking.id}`;
      
      // Debug the conditions
      console.log('Email conditions check:');
      console.log('- Email already sent:', sentEmails.has(emailSentKey));
      console.log('- Has instructor email:', !!booking.instructor?.email);
      console.log('- Has document_id:', !!documentId);
      
      if (!sentEmails.has(emailSentKey) && booking.instructor?.email && documentId) {
        console.log('All conditions met - sending email to instructor');
        sentEmails.add(emailSentKey);
        
        // Create Google Maps link for location
        const googleMapsLink = createGoogleMapsLink(booking.location);
        
        // Send email to instructor about new booking
        const studentName = booking.student ? `${booking.student.firstName} ${booking.student.lastName}` : 'Unknown Student';
        await strapi.plugins['email'].services.email.send({
          to: booking.instructor.email,
          subject: `New Class Booking - Action Required - ${studentName}`,
          html: `
            <h2>New Class Booking</h2>
            <p>Hello ${booking.instructor.firstName} ${booking.instructor.lastName},</p>
            <p>A new class booking has been created and requires your confirmation.</p>
            
            <h3>Booking Details:</h3>
            <ul>
              <li><strong>Title:</strong> ${booking.title}</li>
              <li><strong>Start Time:</strong> ${new Date(booking.start).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
              <li><strong>End Time:</strong> ${new Date(booking.end).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
              <li><strong>Type:</strong> ${booking.offering}</li>
              ${booking.location ? `<li><strong>Location:</strong> ${booking.location}${googleMapsLink ? ` - <a href="${googleMapsLink}" style="color: #007bff;">View on Google Maps</a>` : ''}</li>` : ''}
              <li><strong>Status:</strong> ${booking.bookingStatus}</li>
              ${booking.student ? `<li><strong>Student:</strong> ${booking.student.firstName} ${booking.student.lastName}</li>` : ''}
            </ul>
            
            <p><strong>Action Required:</strong> Please log into the admin panel to review and confirm this booking.</p>
            
            <p>
              <a href="${process.env.ADMIN_URL || 'http://localhost:1337/admin'}/content-manager/collection-types/api::class-booking.class-booking/${documentId}" 
                 style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Review Booking
              </a>
            </p>
            
            <p>Best regards,<br>Hallel Academy</p>
          `
        });
        
        console.log(`Email sent to instructor for booking ${booking.id} with document_id ${documentId}`);
      } else {
        if (!documentId) {
          console.log(`No document_id found for booking ${booking.id}, email not sent`);
        } else if (!booking.instructor?.email) {
          console.log(`No instructor email found for booking ${booking.id}, email not sent`);
        } else {
          console.log(`Email already sent for booking ${booking.id}, skipping duplicate`);
        }
      }
    } catch (error) {
      console.error('Error sending instructor notification:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    
    console.log('afterUpdate triggered for booking:', result.id);
    
    try {
      // Fetch the complete booking with populated relations
      /** @type {any} */
      const booking = await strapi.entityService.findOne('api::class-booking.class-booking', result.id, {
        populate: ['instructor', 'student']
      });

      // Get the document ID - Method 1 works well, so use it as primary
      let documentId = result.documentId || result.id;
      console.log('Document ID retrieved:', documentId);

      console.log('Update - Booking id:', booking.id, 'Document ID:', documentId, 'Status:', booking.bookingStatus);
      console.log('Update - Instructor:', booking.instructor ? `${booking.instructor.firstName} ${booking.instructor.lastName} (${booking.instructor.email})` : 'No instructor');
      console.log('Update - Student:', booking.student ? `${booking.student.firstName} ${booking.student.lastName} (${booking.student.email})` : 'No student');

      // Check if this is a new booking that hasn't had its initial email sent
      const emailSentKey = `creation_${booking.id}`;
      
      if (documentId && !sentEmails.has(emailSentKey) && booking.instructor?.email) {
        console.log('Sending initial email for newly created booking');
        sentEmails.add(emailSentKey);
        
        // Create Google Maps link for location
        const googleMapsLink = createGoogleMapsLink(booking.location);
        
        // Send email to instructor about new booking
        const studentName = booking.student ? `${booking.student.firstName} ${booking.student.lastName}` : 'Unknown Student';
        await strapi.plugins['email'].services.email.send({
          to: booking.instructor.email,
          subject: `New Class Booking - Action Required - ${studentName}`,
          html: `
            <h2>New Class Booking</h2>
            <p>Hello ${booking.instructor.firstName} ${booking.instructor.lastName},</p>
            <p>A new class booking has been created and requires your confirmation.</p>
            
            <h3>Booking Details:</h3>
            <ul>
              <li><strong>Title:</strong> ${booking.title}</li>
              <li><strong>Start Time:</strong> ${new Date(booking.start).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
              <li><strong>End Time:</strong> ${new Date(booking.end).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
              <li><strong>Type:</strong> ${booking.offering}</li>
              ${booking.location ? `<li><strong>Location:</strong> ${booking.location}${googleMapsLink ? ` - <a href="${googleMapsLink}" style="color: #007bff;">View on Google Maps</a>` : ''}</li>` : ''}
              <li><strong>Status:</strong> ${booking.bookingStatus}</li>
              ${booking.student ? `<li><strong>Student:</strong> ${booking.student.firstName} ${booking.student.lastName}</li>` : ''}
            </ul>
            
            <p><strong>Action Required:</strong> Please log into the admin panel to review and confirm this booking.</p>
            
            <p>
              <a href="${process.env.ADMIN_URL || 'http://localhost:1337/admin'}/content-manager/collection-types/api::class-booking.class-booking/${documentId}" 
                 style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Review Booking
              </a>
            </p>
            
            <p>Best regards,<br>Hallel Academy</p>
          `
        });
        
        console.log(`Email sent to instructor for booking ${booking.id} with document_id ${documentId}`);
        return; // Exit early since we sent the initial email
      }

      // Check if status changed to Confirmed
      if (booking.bookingStatus === 'Confirmed') {
        // Check if we've already sent confirmation emails for this booking
        const confirmationEmailSentKey = `confirmation_${booking.id}`;
        
        if (!sentEmails.has(confirmationEmailSentKey)) {
          console.log('Status changed to Confirmed - sending confirmation emails');
          sentEmails.add(confirmationEmailSentKey);
          
          // Generate Google Calendar link
          const startDate = new Date(booking.start);
          const endDate = new Date(booking.end);
          
          const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Class with ${booking.instructor.firstName} ${booking.instructor.lastName}`)}&location=${encodeURIComponent(booking.location || 'Remote')}`;

          // Create Google Maps link for location
          const googleMapsLink = createGoogleMapsLink(booking.location);

          // Update the booking with the event link
          await strapi.entityService.update('api::class-booking.class-booking', result.id, {
            data: {
              eventLink: googleCalendarLink
            }
          });

          // Send email to student with calendar invite
          if (booking.student && booking.student.email) {
            await strapi.plugins['email'].services.email.send({
              to: booking.student.email,
              subject: 'Class Booking Confirmed - ' + booking.title,
              html: `
                <h2>Booking Confirmed!</h2>
                <p>Hello ${booking.student.firstName} ${booking.student.lastName},</p>
                <p>Your class booking has been confirmed by the instructor.</p>
                
                <h3>Booking Details:</h3>
                <ul>
                  <li><strong>Title:</strong> ${booking.title}</li>
                  <li><strong>Start Time:</strong> ${new Date(booking.start).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
                  <li><strong>End Time:</strong> ${new Date(booking.end).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
                  <li><strong>Type:</strong> ${booking.offering}</li>
                  ${booking.location ? `<li><strong>Location:</strong> ${booking.location}${googleMapsLink ? ` - <a href="${googleMapsLink}" style="color: #007bff;">View on Google Maps</a>` : ''}</li>` : ''}
                  <li><strong>Instructor:</strong> ${booking.instructor.firstName} ${booking.instructor.lastName}</li>
                </ul>
                
                ${googleCalendarLink ? `
                <p>You can add this event to your calendar using the link below:</p>
                
                <p>
                  <a href="${googleCalendarLink}" 
                     style="background-color: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Add to Google Calendar
                  </a>
                </p>
                ` : ''}
                
                <p>Best regards,<br>Hallel Academy</p>
              `
            });
            
            console.log(`Confirmation email sent to student for booking ${booking.id}`);
          }

          // Send confirmation email to instructor
          if (booking.instructor && booking.instructor.email) {
            const studentName = booking.student ? `${booking.student.firstName} ${booking.student.lastName}` : 'Unknown Student';
            await strapi.plugins['email'].services.email.send({
              to: booking.instructor.email,
              subject: `Booking Confirmed - ${booking.title} - ${studentName}`,
              html: `
                <h2>Booking Confirmed</h2>
                <p>Hello ${booking.instructor.firstName} ${booking.instructor.lastName},</p>
                <p>The following class booking has been confirmed:</p>
                
                <h3>Booking Details:</h3>
                <ul>
                  <li><strong>Title:</strong> ${booking.title}</li>
                  <li><strong>Start Time:</strong> ${new Date(booking.start).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
                  <li><strong>End Time:</strong> ${new Date(booking.end).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
                  <li><strong>Type:</strong> ${booking.offering}</li>
                  ${booking.location ? `<li><strong>Location:</strong> ${booking.location}${googleMapsLink ? ` - <a href="${googleMapsLink}" style="color: #007bff;">View on Google Maps</a>` : ''}</li>` : ''}
                  <li><strong>Student:</strong> ${booking.student.firstName} ${booking.student.lastName}</li>
                  <li><strong>Student Email:</strong> ${booking.student.email}</li>
                </ul>
                
                <p>Please ensure you're available for this session.</p>
                
                ${googleCalendarLink ? `
                <p>You can add this event to your calendar using the link below:</p>
                
                <p>
                  <a href="${googleCalendarLink}" 
                     style="background-color: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Add to Google Calendar
                  </a>
                </p>
                ` : ''}
                
                <p>Best regards,<br>Hallel Academy</p>
              `
            });
            
            console.log(`Confirmation email sent to instructor for booking ${booking.id}`);
          }
        } else {
          console.log(`Confirmation emails already sent for booking ${booking.id}, skipping duplicate`);
        }
      }
    } catch (error) {
      console.error('Error sending confirmation emails:', error);
    }
  }
};