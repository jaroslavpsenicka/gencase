package gencase.ui;

import com.intellij.openapi.options.Configurable;
import com.intellij.ui.JBColor;
import com.intellij.util.ui.JBUI;
import gencase.Configuration;
import org.jetbrains.annotations.Nls;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import javax.swing.*;
import javax.swing.border.CompoundBorder;
import javax.swing.border.MatteBorder;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import java.awt.*;

public class GenCaseConfigurable implements Configurable {

    private JPanel component;
    private JTextField urlField;
    private JTextField usernameField;
    private JPasswordField passwordField;

    private boolean isDirty;

    @Nls
    @Override
    public String getDisplayName() {
        return "GenCase";
    }

    @Nullable
    @Override
    public String getHelpTopic() {
        return null;
    }

    @Nullable
    @Override
    public JComponent createComponent() {
        JPanel contents = new JPanel();
        contents.setLayout(new BoxLayout(contents, BoxLayout.Y_AXIS));
        contents.add(createUrlCredentialsPanel());
        this.component = new JPanel(new BorderLayout());
        this.component.add(contents, BorderLayout.NORTH);
        return this.component;
    }

    @Override
    public boolean isModified() {
        return isDirty;
    }

    @Override
    public void apply() {
        Configuration configuration = Configuration.getInstance();
        configuration.setUrl(urlField.getText());
        configuration.setUsername(usernameField.getText());
        configuration.setPassword(new String(passwordField.getPassword()));
    }

    @Override
    public void reset() {
        urlField.setText(Configuration.getInstance().getUrl());
        usernameField.setText(Configuration.getInstance().getUsername());
        passwordField.setText(Configuration.getInstance().getPassword());
    }

    @Override
    public void disposeUIResources() {
        component = null;
    }

    @NotNull
    private JPanel label(String text, JComponent component) {
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.X_AXIS));
        JLabel label = new JLabel(text);
        label.setPreferredSize(new Dimension(150, 20));
        label.setLabelFor(component);
        panel.add(label);
        panel.add(component);
        return panel;
    }

    @NotNull
    private JPanel createUrlCredentialsPanel() {
        urlField = new JTextField();
        urlField.getDocument().addDocumentListener((SimpleDocumentListener) listener -> isDirty = true);
        usernameField = new JTextField();
        usernameField.getDocument().addDocumentListener((SimpleDocumentListener) listener -> isDirty = true);
        passwordField = new JPasswordField();
        passwordField.getDocument().addDocumentListener((SimpleDocumentListener) listener -> isDirty = true);

        JPanel urlCredentialsPanel = new JPanel();
        BoxLayout layout = new BoxLayout(urlCredentialsPanel, BoxLayout.Y_AXIS);
        urlCredentialsPanel.setLayout(layout);
        urlCredentialsPanel.add(new TitlePanel("GenCase Server"));
        urlCredentialsPanel.add(label("URL:", urlField));
        urlCredentialsPanel.add(label("Username:", usernameField));
        urlCredentialsPanel.add(label("Password:", passwordField));
        return urlCredentialsPanel;
    }

    @FunctionalInterface
    interface SimpleDocumentListener extends DocumentListener {
        void update(DocumentEvent e);

        @Override
        default void insertUpdate(DocumentEvent e) {
            update(e);
        }
        @Override
        default void removeUpdate(DocumentEvent e) {
            update(e);
        }
        @Override
        default void changedUpdate(DocumentEvent e) {
        }
    }

    static class TitlePanel extends JPanel {

        TitlePanel(String title) {
            setLayout(new BorderLayout());
            setBorder(new CompoundBorder(
                JBUI.Borders.empty(10, 0),
                new MatteBorder(0, 0, 1, 0, JBColor.GRAY)));
            JLabel label = new JLabel(title);
            label.setFont(label.getFont().deriveFont(Font.BOLD));
            add(label);
        }
    }

}

